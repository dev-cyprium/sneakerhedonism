'use client'

import { FormError } from '@/components/forms/FormError'
import { FormItem } from '@/components/forms/FormItem'
import { Message } from '@/components/Message'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/providers/Auth'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import React, { useCallback, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'

type FormData = {
  email: string
  password: string
  passwordConfirm: string
}

export const CreateAccountForm: React.FC = () => {
  const searchParams = useSearchParams()
  const allParams = searchParams.toString() ? `?${searchParams.toString()}` : ''
  const { login } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<null | string>(null)

  const {
    formState: { errors },
    handleSubmit,
    register,
    watch,
  } = useForm<FormData>()

  const password = useRef({})
  password.current = watch('password', '')

  const onSubmit = useCallback(
    async (data: FormData) => {
      const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/users`, {
        body: JSON.stringify(data),
        headers: {
          'Content-Type': 'application/json',
        },
        method: 'POST',
      })

      if (!response.ok) {
        const message = response.statusText || 'Došlo je do greške pri kreiranju naloga.'
        setError(message)
        return
      }

      const redirect = searchParams.get('redirect')

      const timer = setTimeout(() => {
        setLoading(true)
      }, 1000)

      try {
        await login(data)
        clearTimeout(timer)
        if (redirect) router.push(redirect)
        else router.push(`/account?success=${encodeURIComponent('Nalog je uspešno kreiran')}`)
      } catch (_) {
        clearTimeout(timer)
        setError('Došlo je do greške sa unetim podacima. Molimo pokušajte ponovo.')
      }
    },
    [login, router, searchParams],
  )

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Message error={error} />

      <div className="flex flex-col gap-5 mb-6">
        <FormItem>
          <Label htmlFor="email" className="mb-2">
            Email adresa
          </Label>
          <Input
            id="email"
            {...register('email', { required: 'Email je obavezan.' })}
            type="email"
          />
          {errors.email && <FormError message={errors.email.message} />}
        </FormItem>

        <FormItem>
          <Label htmlFor="password" className="mb-2">
            Nova lozinka
          </Label>
          <Input
            id="password"
            {...register('password', { required: 'Lozinka je obavezna.' })}
            type="password"
          />
          {errors.password && <FormError message={errors.password.message} />}
        </FormItem>

        <FormItem>
          <Label htmlFor="passwordConfirm" className="mb-2">
            Potvrdite lozinku
          </Label>
          <Input
            id="passwordConfirm"
            {...register('passwordConfirm', {
              required: 'Molimo potvrdite lozinku.',
              validate: (value) => value === password.current || 'Lozinke se ne poklapaju',
            })}
            type="password"
          />
          {errors.passwordConfirm && <FormError message={errors.passwordConfirm.message} />}
        </FormItem>
      </div>
      <Button
        disabled={loading}
        type="submit"
        variant="default"
        className="w-full py-6 text-base font-medium"
      >
        {loading ? 'Obrada...' : 'Kreirajte nalog'}
      </Button>

      <p className="text-center text-sm text-muted-foreground mt-6">
        {'Već imate nalog? '}
        <Link href={`/login${allParams}`} className="font-medium text-foreground underline underline-offset-4 hover:text-primary">
          Prijavite se
        </Link>
      </p>
    </form>
  )
}
