'use client'

import { FormError } from '@/components/forms/FormError'
import { FormItem } from '@/components/forms/FormItem'
import { Message } from '@/components/Message'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/providers/Auth'
import { useRouter, useSearchParams } from 'next/navigation'
import React, { useCallback, useState } from 'react'
import { useForm } from 'react-hook-form'

type FormData = {
  password: string
  passwordConfirm: string
}

export const ResetPasswordForm: React.FC = () => {
  const searchParams = useSearchParams()
  const token = searchParams.get('token')
  const { resetPassword } = useAuth()
  const router = useRouter()
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const {
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
    watch,
  } = useForm<FormData>()

  const onSubmit = useCallback(
    async (data: FormData) => {
      if (!token) {
        setError('Token za resetovanje lozinke nedostaje. Pokušajte ponovo sa linkom iz emaila.')
        return
      }

      try {
        await resetPassword({
          password: data.password,
          passwordConfirm: data.passwordConfirm,
          token,
        })
        setSuccess(true)
        setError('')
        setTimeout(() => router.push('/account'), 2000)
      } catch (_) {
        setError('Došlo je do greške pri resetovanju lozinke. Token je možda istekao. Pokušajte ponovo.')
      }
    },
    [token, resetPassword, router],
  )

  if (!token) {
    return (
      <div className="max-w-lg">
        <h1 className="text-xl mb-4">Nevažeći link</h1>
        <p className="text-muted-foreground">
          Link za resetovanje lozinke je nevažeći ili je istekao. Pokušajte ponovo sa stranice za
          zaboravljenu lozinku.
        </p>
      </div>
    )
  }

  if (success) {
    return (
      <div className="max-w-lg">
        <h1 className="text-xl mb-4">Lozinka je resetovana</h1>
        <p className="text-muted-foreground">
          Vaša lozinka je uspešno promenjena. Bićete preusmereni na vaš nalog.
        </p>
      </div>
    )
  }

  return (
    <div className="max-w-lg">
      <h1 className="text-xl mb-4">Resetujte lozinku</h1>
      <p className="text-muted-foreground mb-8">Unesite novu lozinku ispod.</p>

      <form onSubmit={handleSubmit(onSubmit)}>
        <Message className="mb-8" error={error} />

        <div className="flex flex-col gap-5 mb-6">
          <FormItem>
            <Label htmlFor="password">Nova lozinka</Label>
            <Input
              id="password"
              type="password"
              {...register('password', {
                required: 'Lozinka je obavezna.',
                minLength: { value: 6, message: 'Lozinka mora imati najmanje 6 karaktera.' },
              })}
            />
            {errors.password && <FormError message={errors.password.message} />}
          </FormItem>

          <FormItem>
            <Label htmlFor="passwordConfirm">Potvrdite lozinku</Label>
            <Input
              id="passwordConfirm"
              type="password"
              {...register('passwordConfirm', {
                required: 'Potvrda lozinke je obavezna.',
                validate: (val) => val === watch('password') || 'Lozinke se ne poklapaju.',
              })}
            />
            {errors.passwordConfirm && <FormError message={errors.passwordConfirm.message} />}
          </FormItem>
        </div>

        <Button disabled={isSubmitting} type="submit" variant="default" className="w-full py-6 text-base font-medium">
          {isSubmitting ? 'Obrada...' : 'Resetujte lozinku'}
        </Button>
      </form>
    </div>
  )
}
