import { createHmac, timingSafeEqual } from 'crypto'

// Spam defences for the website forms, all on our own server (no third-party
// CAPTCHA, nothing for visitors to solve).

const key = () => `${process.env.PAYLOAD_SECRET || ''}:forms`
const sign = (value: string) => createHmac('sha256', key()).update(value).digest('base64url')

/** A form ticket stays valid for 12 hours after the page asked for it. */
const MAX_AGE_MS = 12 * 60 * 60 * 1000

/**
 * A signed timestamp the page fetches with JavaScript once it has loaded.
 * Bots that post straight to the server never get one, and the timestamp
 * shows how long the form was open before it was sent.
 */
export const createTicket = (now = Date.now()) => {
  const issued = String(now)
  return `${issued}.${sign(issued)}`
}

export type TicketCheck = 'ok' | 'missing' | 'invalid' | 'too-fast' | 'expired'

export const checkTicket = (ticket: string, minAgeMs: number, now = Date.now()): TicketCheck => {
  if (!ticket) return 'missing'
  const [issued, signature] = ticket.split('.')
  if (!issued || !signature) return 'invalid'
  const given = Buffer.from(signature)
  const expected = Buffer.from(sign(issued))
  if (given.length !== expected.length || !timingSafeEqual(given, expected)) return 'invalid'
  const age = now - Number(issued)
  if (!Number.isFinite(age) || age < 0) return 'invalid'
  if (age < minAgeMs) return 'too-fast'
  if (age > MAX_AGE_MS) return 'expired'
  return 'ok'
}

/** A one-way code for the sender's IP address, so rate limits work without storing the address. */
export const hashIP = (ip: string) => createHmac('sha256', key()).update(`ip:${ip}`).digest('hex').slice(0, 32)

const LINK = /\b(?:https?:\/\/|www\.)\S+/i
const LINKS = new RegExp(LINK.source, 'gi')

/** Typical link spam: HTML or BBCode links, a link in the name, or more than two links. */
export const looksLikeSpam = ({ name, message }: { name: string; message: string }) => {
  if (/\[url[=\]]|<a\s+href/i.test(`${name}\n${message}`)) return true
  if (LINK.test(name)) return true
  return (message.match(LINKS)?.length ?? 0) > 2
}
