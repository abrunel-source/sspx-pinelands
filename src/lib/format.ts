const dateFormat = new Intl.DateTimeFormat('en-ZA', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
  timeZone: 'Africa/Johannesburg',
})

const eventFormat = new Intl.DateTimeFormat('en-ZA', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  hour: '2-digit',
  minute: '2-digit',
  hour12: false,
  timeZone: 'Africa/Johannesburg',
})

const feastFormat = new Intl.DateTimeFormat('en-GB', {
  weekday: 'short',
  day: 'numeric',
  month: 'short',
  timeZone: 'Africa/Johannesburg',
})

/** "Sun 25 Oct" */
export const formatFeastDate = (value?: string | null) =>
  value
    ? feastFormat
        .formatToParts(new Date(value))
        .filter((p) => p.type !== 'literal')
        .map((p) => p.value)
        .join(' ')
    : ''

export const formatDate = (value?: string | null) => (value ? dateFormat.format(new Date(value)) : '')

export const formatEventDate = (value?: string | null) => (value ? eventFormat.format(new Date(value)) : '')

export const CATEGORY_LABELS: Record<string, string> = {
  announcement: 'Announcement',
  reading: 'Reading',
  sermon: 'Sermon',
  'parish-life': 'Parish life',
}

export const slugify = (text: string) =>
  text
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)

export const toRoman = (n: number) => {
  const map: [number, string][] = [
    [10, 'X'],
    [9, 'IX'],
    [5, 'V'],
    [4, 'IV'],
    [1, 'I'],
  ]
  let out = ''
  for (const [value, numeral] of map) {
    while (n >= value) {
      out += numeral
      n -= value
    }
  }
  return out
}

export const telHref = (phone: string) => {
  const digits = phone.replace(/[^\d+]/g, '')
  return `tel:${digits.startsWith('0') ? `+27${digits.slice(1)}` : digits}`
}
