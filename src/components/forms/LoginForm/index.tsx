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
import React, { useCallback, useRef } from 'react'
import { useForm } from 'react-hook-form'

type FormData = {
  email: string
  password: string
}

export const LoginForm: React.FC = () => {
  const searchParams = useSearchParams()
  const allParams = searchParams.toString() ? `?${searchParams.toString()}` : ''
  const redirect = useRef(searchParams.get('redirect'))
  const { login } = useAuth()
  const router = useRouter()
  const [error, setError] = React.useState<null | string>(null)

  const {
    formState: { errors, isLoading },
    handleSubmit,
    register,
  } = useForm<FormData>()

  const onSubmit = useCallback(
    async (data: FormData) => {
      try {
        await login(data)
        if (redirect?.current) router.push(redirect.current)
        else router.push('/account')
      } catch (_) {
        setError('Došlo je do greške sa unetim podacima. Molimo pokušajte ponovo.')
      }
    },
    [login, router],
  )

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Message error={error} />
      <div className="flex flex-col gap-5 mb-6">
        <FormItem>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            {...register('email', { required: 'Email je obavezan.' })}
          />
          {errors.email && <FormError message={errors.email.message} />}
        </FormItem>

        <FormItem>
          <Label htmlFor="password">Lozinka</Label>
          <Input
            id="password"
            type="password"
            {...register('password', { required: 'Molimo unesite lozinku.' })}
          />
          {errors.password && <FormError message={errors.password.message} />}
        </FormItem>

        <p className="text-sm text-muted-foreground -mt-1">
          Zaboravili ste lozinku?{' '}
          <Link
            href={`/recover-password${allParams}`}
            className="font-medium text-foreground underline underline-offset-4 hover:text-primary"
          >
            Kliknite ovde da je resetujete
          </Link>
        </p>
      </div>

      <Button
        disabled={isLoading}
        type="submit"
        variant="default"
        className="w-full py-6 text-base font-medium"
      >
        {isLoading ? 'Obrada...' : 'Prijavite se'}
      </Button>

      <p className="text-center text-sm text-muted-foreground mt-6">
        {'Nemate nalog? '}
        <Link
          href={`/create-account${allParams}`}
          className="font-medium text-foreground underline underline-offset-4 hover:text-primary"
        >
          Kreirajte nalog
        </Link>
      </p>
    </form>
  )
}
