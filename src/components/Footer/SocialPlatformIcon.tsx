import { Instagram } from 'lucide-react'
import React from 'react'

import { cn } from '@/utilities/cn'

export type SocialPlatform = 'instagram' | 'tiktok'

type SocialPlatformIconProps = {
  platform: SocialPlatform
  className?: string
}

function TikTokIcon({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      className={cn(className)}
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.9"
      viewBox="0 0 24 24"
    >
      <path d="M14 3v9.5a4 4 0 1 1-4-4" />
      <path d="M14 3a5.5 5.5 0 0 0 5.5 5.5" />
    </svg>
  )
}

export function SocialPlatformIcon({ platform, className }: SocialPlatformIconProps) {
  if (platform === 'tiktok') {
    return <TikTokIcon className={className} />
  }

  return <Instagram className={className} />
}

