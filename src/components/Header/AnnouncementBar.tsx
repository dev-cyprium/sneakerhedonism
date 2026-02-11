import React from 'react'

interface Props {
  enabled?: boolean | null
  text?: string | null
}

export function AnnouncementBar({ enabled, text }: Props) {
  if (!enabled || !text) return null

  return (
    <div className="bg-accent-brand text-white text-center py-2 px-4">
      <p className="text-xs uppercase font-mono tracking-widest">{text}</p>
    </div>
  )
}
