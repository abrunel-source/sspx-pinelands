'use server'

import { headers } from 'next/headers'
import type { Where } from 'payload'

import { brandedEmail, escapeHTML } from '@/lib/email'
import { getPayloadClient } from '@/lib/payload'
import { checkTicket, createTicket, hashIP, looksLikeSpam } from '@/lib/spam'
import { getServerSideURL } from '@/lib/url'

export type FormState = {
  status: 'idle' | 'success' | 'error'
  message?: string
  errors?: Partial<Record<'name' | 'email' | 'message', string>>
}

const FORM_TYPES = ['contact', 'newsletter', 'school'] as const
type FormType = (typeof FORM_TYPES)[number]

const SUBJECTS: Record<FormType, string> = {
  contact: 'New message from the website',
  newsletter: 'New mailing list sign-up',
  school: 'New homeschooling registration of interest',
}

const SUCCESS: Record<FormType, string> = {
  contact: 'Thank you. Your message has been sent and the priest will reply as soon as he can.',
  newsletter: 'Thank you. You have been added to the mailing list.',
  school: 'Thank you. We will be in touch when registrations open.',
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

// Limits, counted in the database so they hold across every server instance.
const PER_SENDER = { max: 5, windowMs: 10 * 60 * 1000 }
const SITE_WIDE = { max: 30, windowMs: 60 * 60 * 1000 }
const DUPLICATE_WINDOW_MS = 24 * 60 * 60 * 1000

// How long a person needs at least, from the page loading to pressing send.
const MIN_FILL_MS: Record<FormType, number> = { contact: 3000, newsletter: 1500, school: 1500 }

const since = (ms: number) => new Date(Date.now() - ms).toISOString()

const field = (data: FormData, name: string, max: number) =>
  String(data.get(name) ?? '')
    .trim()
    .slice(0, max)

/** Issued to the page once it has loaded in a browser; required to send a form. */
export async function getFormTicket() {
  return createTicket()
}

export async function submitForm(_prev: FormState, data: FormData): Promise<FormState> {
  const formType = String(data.get('formType')) as FormType
  if (!FORM_TYPES.includes(formType)) return { status: 'error', message: 'Unknown form.' }

  // Bots are shown the normal thank-you so they don't learn what gave them away.
  const fakeSuccess: FormState = { status: 'success', message: SUCCESS[formType] }

  // Hidden field that people never see; bots tend to fill it in.
  if (field(data, 'website', 200)) return fakeSuccess

  switch (checkTicket(field(data, 'ticket', 200), MIN_FILL_MS[formType])) {
    case 'invalid':
    case 'too-fast':
      return fakeSuccess
    case 'missing':
      return { status: 'error', message: 'The page had not finished loading. Please press send again.' }
    case 'expired':
      return { status: 'error', message: 'This page was open for a long time. Please press send again.' }
  }

  const name = field(data, 'name', 120)
  const email = field(data, 'email', 200).toLowerCase()
  const topic = field(data, 'topic', 80)
  const message = field(data, 'message', 5000)

  const errors: FormState['errors'] = {}
  if (!EMAIL_RE.test(email)) errors.email = 'Please enter a valid email address.'
  if (formType === 'contact') {
    if (!name) errors.name = 'Please tell us your name.'
    if (message.length < 2) errors.message = 'Please write a message.'
  }
  if (Object.keys(errors).length) return { status: 'error', message: 'Please check the highlighted fields.', errors }

  const requestHeaders = await headers()
  const ip = requestHeaders.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
  const ipHash = hashIP(ip)

  const payload = await getPayloadClient()
  const count = async (where: Where) =>
    (await payload.count({ collection: 'form-submissions', where, overrideAccess: true })).totalDocs

  if ((await count({ ipHash: { equals: ipHash }, createdAt: { greater_than: since(PER_SENDER.windowMs) } })) >= PER_SENDER.max) {
    return { status: 'error', message: 'Too many messages in a short time. Please try again in a few minutes.' }
  }

  // The same message sent twice (a double click, or a resend) goes through once.
  const duplicate = await count({
    formType: { equals: formType },
    email: { equals: email },
    ...(message ? { message: { equals: message } } : {}),
    createdAt: { greater_than: since(DUPLICATE_WINDOW_MS) },
  })
  if (duplicate) return { status: 'success', message: SUCCESS[formType] }

  // Link spam is kept in the admin as Spam, in case a real message is caught, but not emailed.
  if (looksLikeSpam({ name, message })) {
    await payload.create({
      collection: 'form-submissions',
      data: { formType, name, email, topic, message, status: 'spam', ipHash },
      overrideAccess: true,
    })
    return fakeSuccess
  }

  // A cap on emails per hour, so a flood can never bury the inbox.
  if ((await count({ status: { not_equals: 'spam' }, createdAt: { greater_than: since(SITE_WIDE.windowMs) } })) >= SITE_WIDE.max) {
    return { status: 'error', message: 'The website is receiving an unusual number of messages. Please try again later, or email us directly.' }
  }

  const settings = await payload.findGlobal({ slug: 'site-settings', depth: 0 })

  const submission = await payload.create({
    collection: 'form-submissions',
    data: { formType, name, email, topic, message, status: 'new', ipHash },
    overrideAccess: true,
  })

  const rows = [
    ['Name', name],
    ['Email', email],
    ['Topic', topic],
  ].filter(([, value]) => value)

  try {
    await payload.sendEmail({
      to: settings.formsRecipient,
      replyTo: email,
      subject: `${SUBJECTS[formType]}${name ? `: ${name}` : ''}`,
      html: brandedEmail({
        heading: SUBJECTS[formType],
        body: `${rows.map(([label, value]) => `<p style="margin:0 0 6px;"><strong>${label}:</strong> ${escapeHTML(value)}</p>`).join('')}
${message ? `<p style="margin:16px 0 0;white-space:pre-wrap;">${escapeHTML(message)}</p>` : ''}
<p style="margin:20px 0 0;font-size:13px;color:#5B5E66;">Reply to this email to answer ${escapeHTML(name || email)} directly.</p>`,
        button: {
          label: 'Open in the admin panel',
          url: `${getServerSideURL()}/admin/collections/form-submissions/${submission.id}`,
        },
      }),
    })
    await payload.update({
      collection: 'form-submissions',
      id: submission.id,
      data: { emailDelivered: true },
      overrideAccess: true,
    })
  } catch (err) {
    // The submission is saved either way, so nothing is lost if email fails.
    payload.logger.error({ err }, 'Could not send form notification email')
  }

  return { status: 'success', message: SUCCESS[formType] }
}
