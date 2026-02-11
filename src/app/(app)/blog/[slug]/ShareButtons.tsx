'use client'

import { Facebook, Twitter, Mail } from 'lucide-react'

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M3 21l1.65-3.8a9 9 0 1 1 3.4 2.9L3 21" />
      <path d="M9 10a.5.5 0 0 0 1 0V9a.5.5 0 0 0-1 0v1a5 5 0 0 0 5 5h1a.5.5 0 0 0 0-1h-1a.5.5 0 0 0 0 1" />
    </svg>
  )
}

export function ShareButtons({ title }: { title: string }) {
  const getUrl = () => {
    if (typeof window === 'undefined') return ''
    return window.location.href
  }

  const share = (network: 'facebook' | 'twitter' | 'whatsapp' | 'email') => {
    const url = getUrl()
    const encoded = encodeURIComponent(url)
    const encodedTitle = encodeURIComponent(title)

    const urls: Record<string, string> = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encoded}`,
      twitter: `https://twitter.com/intent/tweet?url=${encoded}&text=${encodedTitle}`,
      whatsapp: `https://api.whatsapp.com/send?text=${encodedTitle}%20${encoded}`,
      email: `mailto:?subject=${encodedTitle}&body=${encoded}`,
    }

    if (network === 'email') {
      window.location.href = urls[network]
    } else {
      window.open(urls[network], '_blank', 'noopener,noreferrer,width=600,height=400')
    }
  }

  return (
    <div className="flex items-center gap-3">
      <span className="text-sm font-medium text-muted-foreground">Podeli:</span>
      <button
        onClick={() => share('facebook')}
        className="flex items-center justify-center size-9 rounded-full border border-border text-muted-foreground transition-colors hover:text-accent-brand hover:border-accent-brand"
        aria-label="Podeli na Facebook"
      >
        <Facebook className="size-4" />
      </button>
      <button
        onClick={() => share('twitter')}
        className="flex items-center justify-center size-9 rounded-full border border-border text-muted-foreground transition-colors hover:text-accent-brand hover:border-accent-brand"
        aria-label="Podeli na Twitter"
      >
        <Twitter className="size-4" />
      </button>
      <button
        onClick={() => share('email')}
        className="flex items-center justify-center size-9 rounded-full border border-border text-muted-foreground transition-colors hover:text-accent-brand hover:border-accent-brand"
        aria-label="Podeli putem Email-a"
      >
        <Mail className="size-4" />
      </button>
      <button
        onClick={() => share('whatsapp')}
        className="flex items-center justify-center size-9 rounded-full border border-border text-muted-foreground transition-colors hover:text-accent-brand hover:border-accent-brand"
        aria-label="Podeli na WhatsApp"
      >
        <WhatsAppIcon className="size-4" />
      </button>
    </div>
  )
}
