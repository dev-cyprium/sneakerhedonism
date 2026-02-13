import type { Metadata } from 'next'

import { RenderParams } from '@/components/RenderParams'
import { mergeOpenGraph } from '@/utilities/mergeOpenGraph'
import React from 'react'

import { headers as getHeaders } from 'next/headers'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { LoginForm } from '@/components/forms/LoginForm'
import { redirect } from 'next/navigation'

export default async function Login() {
  const headers = await getHeaders()
  const payload = await getPayload({ config: configPromise })
  const { user } = await payload.auth({ headers })

  if (user) {
    redirect(`/account?warning=${encodeURIComponent('Već ste prijavljeni.')}`)
  }

  return (
    <div className="container py-16 flex flex-col items-center min-h-[60vh]">
      <div className="w-full max-w-md">
        <RenderParams />
        <div className="rounded-xl border border-border bg-card p-8 shadow-sm">
          <h1 className="text-2xl font-semibold mb-2">Prijavite se</h1>
          <p className="text-muted-foreground text-sm mb-6">
            Pristupite nalogu i upravljajte porudžbinama
          </p>
          <LoginForm />
        </div>
      </div>
    </div>
  )
}

export const metadata: Metadata = {
  description: 'Prijavite se ili kreirajte nalog da biste počeli.',
  openGraph: mergeOpenGraph({
    title: 'Prijava',
    url: '/login',
  }),
  title: 'Prijava',
}
