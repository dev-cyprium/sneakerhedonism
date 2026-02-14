import type { Metadata } from 'next'

import { ResetPasswordForm } from '@/components/forms/ResetPasswordForm'
import { mergeOpenGraph } from '@/utilities/mergeOpenGraph'
import React, { Suspense } from 'react'

export default function ResetPasswordPage() {
  return (
    <div className="container py-16">
      <Suspense>
        <ResetPasswordForm />
      </Suspense>
    </div>
  )
}

export const metadata: Metadata = {
  description: 'Unesite novu lozinku.',
  openGraph: mergeOpenGraph({
    title: 'Resetovanje lozinke',
    url: '/reset-password',
  }),
  title: 'Resetovanje lozinke',
}
