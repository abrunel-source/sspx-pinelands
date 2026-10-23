'use server'

import { headers } from 'next/headers'

import { brandedEmail, escapeHTML } from '@/lib/email'
import { getPayloadClient } from '@/lib/payload'
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

// Best-effort throttle per server instance: 5 submissions per IP per 10 minutes.
const WINDOW_MS = 10 * 60 * 1000
const recent = new Map<string, number[]>()
const throttled = (ip: string) => {
  const now = Date.now()
  const hits = (recent.get(ip) ?? []).filter((t) => now - t < WINDOW_MS)
  hits.push(now)
  recent.set(ip, hits)
  if (recent.size > 5000) recent.clear()
  return hits.length > 5
}

const field = (data: FormData, name: string, max: number) =>
  String(data.get(name) ?? '')
    .trim()
    .slice(0, max)

export async function submitForm(_prev: FormState, data: FormData): Promise<FormState> {
  const formType = String(data.get('formType')) as FormType
  if (!FORM_TYPES.includes(formType)) return { status: 'error', message: 'Unknown form.' }

  // Hidden field that people never see; bots tend to fill it in.
  if (field(data, 'website', 200)) return { status: 'success', message: SUCCESS[formType] }

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
  if (throttled(ip)) {
    return { status: 'error', message: 'Too many messages in a short time. Please try again in a few minutes.' }
  }

  const payload = await getPayloadClient()
  const settings = await payload.findGlobal({ slug: 'site-settings', depth: 0 })

  const submission = await payload.create({
    collection: 'form-submissions',
    data: { formType, name, email, topic, message, status: 'new' },
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
