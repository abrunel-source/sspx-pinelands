const dateFormat = new Intl.DateTimeFormat('en-ZA', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
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

type DateParts = Record<'weekday' | 'day' | 'month' | 'year' | 'hour' | 'minute', string> & { time: string }

const capeTown = (value: string): DateParts => {
  const parts: Record<string, string> = Object.fromEntries(
    new Intl.DateTimeFormat('en-ZA', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hourCycle: 'h23',
      timeZone: 'Africa/Johannesburg',
    })
      .formatToParts(new Date(value))
      .map((p) => [p.type, p.value]),
  )
  return { ...(parts as Omit<DateParts, 'time'>), time: `${parts.hour}:${parts.minute}` }
}

/**
 * "Saturday 5 December", "Saturday 5 December, 09:30–17:00" or "Monday 14 – Saturday 19 December".
 * A start at midnight means the event has no set time. The year shows when it is not this year.
 */
export const formatEventWhen = (startsAt?: string | null, endsAt?: string | null) => {
  if (!startsAt) return ''
  const start = capeTown(startsAt)
  const end = endsAt ? capeTown(endsAt) : null
  const thisYear = capeTown(new Date().toISOString()).year
  const year = (d: DateParts) => (d.year !== thisYear ? ` ${d.year}` : '')
  const allDay = start.time === '00:00'
  const sameDay = !end || (end.day === start.day && end.month === start.month && end.year === start.year)
  if (sameDay) {
    const until = end && end.time !== start.time ? `–${end.time}` : ''
    return `${start.weekday} ${start.day} ${start.month}${year(start)}${allDay ? '' : `, ${start.time}${until}`}`
  }
  const startPart =
    start.month === end!.month && start.year === end!.year
      ? `${start.weekday} ${start.day}`
      : `${start.weekday} ${start.day} ${start.month}${start.year !== end!.year ? ` ${start.year}` : ''}`
  return `${startPart} – ${end!.weekday} ${end!.day} ${end!.month}${year(end!)}`
}

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
