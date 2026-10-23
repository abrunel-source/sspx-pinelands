'use client'

import { useRowLabel } from '@payloadcms/ui'

export const MassRowLabel = () => {
  const { data, rowNumber } = useRowLabel<{ day?: string; time?: string }>()
  if (!data?.day) return <span>Mass {String((rowNumber ?? 0) + 1).padStart(2, '0')}</span>
  return (
    <span>
      {data.day}
      {data.time ? ` · ${data.time}` : ''}
    </span>
  )
}
