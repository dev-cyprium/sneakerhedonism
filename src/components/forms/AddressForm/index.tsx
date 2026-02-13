'use client'
import React, { useCallback } from 'react'
import { useForm } from 'react-hook-form'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAddresses } from '@payloadcms/plugin-ecommerce/client/react'
import { defaultCountries } from '@payloadcms/plugin-ecommerce/client/react'

const supportedCountries = [
  { label: 'Serbia', value: 'RS' },
  ...defaultCountries,
]
import { Address, Config } from '@/payload-types'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

import { titles } from './constants'
import { Button } from '@/components/ui/button'
import { deepMergeSimple } from 'payload/shared'
import { FormError } from '@/components/forms/FormError'
import { FormItem } from '@/components/forms/FormItem'
import { cn } from '@/utilities/cn'

type AddressFormValues = {
  title?: string | null
  firstName?: string | null
  lastName?: string | null
  company?: string | null
  addressLine1?: string | null
  addressLine2?: string | null
  city?: string | null
  state?: string | null
  postalCode?: string | null
  country?: string | null
  phone?: string | null
}

type Props = {
  addressID?: Config['db']['defaultIDType']
  initialData?: Omit<Address, 'country' | 'id' | 'updatedAt' | 'createdAt'> & { country?: string }
  callback?: (data: Partial<Address>) => void
  /**
   * If true, the form will not submit to the API.
   */
  skipSubmission?: boolean
  /**
   * Compact layout for modals - tighter spacing, grouped fields.
   */
  compact?: boolean
}

export const AddressForm: React.FC<Props> = ({
  addressID,
  initialData,
  callback,
  skipSubmission,
  compact = false,
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<AddressFormValues>({
    defaultValues: { country: 'RS', ...initialData },
  })

  const { createAddress, updateAddress } = useAddresses()

  const onSubmit = useCallback(
    async (data: AddressFormValues) => {
      const newData = deepMergeSimple(initialData || {}, data)

      if (!skipSubmission) {
        if (addressID) {
          await updateAddress(addressID, newData)
        } else {
          await createAddress(newData)
        }
      }

      if (callback) {
        callback(newData)
      }
    },
    [initialData, skipSubmission, callback, addressID, updateAddress, createAddress],
  )

  const gap = compact ? 'gap-3' : 'gap-4'
  const mb = compact ? 'mb-5' : 'mb-8'

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className={cn('flex flex-col', gap, mb)}>
        {/* Name row */}
        <div className={cn('flex flex-col sm:flex-row', gap)}>
          {!compact && (
            <FormItem className="shrink-0 sm:w-24">
              <Label htmlFor="title">Titula</Label>
              <Select
                {...register('title')}
                onValueChange={(value) => setValue('title', value, { shouldValidate: true })}
                defaultValue={initialData?.title || ''}
              >
                <SelectTrigger id="title">
                  <SelectValue placeholder="Titula" />
                </SelectTrigger>
                <SelectContent>
                  {titles.map((title) => (
                    <SelectItem key={title} value={title}>
                      {title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.title && <FormError message={errors.title.message} />}
            </FormItem>
          )}
          <FormItem className={compact ? 'sm:flex-1' : 'flex-1'}>
            <Label htmlFor="firstName">Ime*</Label>
            <Input
              id="firstName"
              autoComplete="given-name"
              {...register('firstName', { required: 'Ime je obavezno.' })}
            />
            {errors.firstName && <FormError message={errors.firstName.message} />}
          </FormItem>
          <FormItem className={compact ? 'sm:flex-1' : 'flex-1'}>
            <Label htmlFor="lastName">Prezime*</Label>
            <Input
              autoComplete="family-name"
              id="lastName"
              {...register('lastName', { required: 'Prezime je obavezno.' })}
            />
            {errors.lastName && <FormError message={errors.lastName.message} />}
          </FormItem>
        </div>

        {/* Phone */}
        <FormItem>
          <Label htmlFor="phone">Telefon*</Label>
          <Input
            type="tel"
            id="phone"
            autoComplete="mobile tel"
            {...register('phone', { required: 'Broj telefona je obavezan.' })}
          />
          {errors.phone && <FormError message={errors.phone.message} />}
        </FormItem>

        {/* Address */}
        <FormItem>
          <Label htmlFor="addressLine1">Adresa (ulica i broj)*</Label>
          <Input
            id="addressLine1"
            autoComplete="address-line1"
            {...register('addressLine1', { required: 'Adresa je obavezna.' })}
          />
          {errors.addressLine1 && <FormError message={errors.addressLine1.message} />}
        </FormItem>

        <FormItem>
          <Label htmlFor="addressLine2">Adresa (nastavak)</Label>
          <Input id="addressLine2" autoComplete="address-line2" {...register('addressLine2')} />
          {errors.addressLine2 && <FormError message={errors.addressLine2.message} />}
        </FormItem>

        {/* City, postal, state row */}
        <div className={cn('grid grid-cols-1 sm:grid-cols-3', gap)}>
          <FormItem>
            <Label htmlFor="city">Grad*</Label>
            <Input
              id="city"
              autoComplete="address-level2"
              {...register('city', { required: 'Grad je obavezan.' })}
            />
            {errors.city && <FormError message={errors.city.message} />}
          </FormItem>
          <FormItem>
            <Label htmlFor="postalCode">Poštanski broj*</Label>
            <Input
              id="postalCode"
              {...register('postalCode', { required: 'Poštanski broj je obavezan.' })}
            />
            {errors.postalCode && <FormError message={errors.postalCode.message} />}
          </FormItem>
          <FormItem>
            <Label htmlFor="state">Pokrajina</Label>
            <Input id="state" autoComplete="address-level1" {...register('state')} />
            {errors.state && <FormError message={errors.state.message} />}
          </FormItem>
        </div>

        {/* Country */}
        <FormItem>
          <Label htmlFor="country">Država*</Label>
          <Select
            {...register('country', { required: 'Država je obavezna.' })}
            onValueChange={(value) => setValue('country', value, { shouldValidate: true })}
            required
            defaultValue={initialData?.country || 'RS'}
          >
            <SelectTrigger id="country" className="w-full">
              <SelectValue placeholder="Država" />
            </SelectTrigger>
            <SelectContent>
              {supportedCountries.map((country) => {
                const value = typeof country === 'string' ? country : country.value
                const label =
                  typeof country === 'string'
                    ? country
                    : typeof country.label === 'string'
                      ? country.label
                      : value
                return (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                )
              })}
            </SelectContent>
          </Select>
          {errors.country && <FormError message={errors.country.message} />}
        </FormItem>

        {/* Company - optional, only in full form */}
        {!compact && (
          <FormItem>
            <Label htmlFor="company">Firma</Label>
            <Input id="company" autoComplete="organization" {...register('company')} />
            {errors.company && <FormError message={errors.company.message} />}
          </FormItem>
        )}
      </div>

      <Button type="submit" className={compact ? 'w-full' : ''}>
        Potvrdi
      </Button>
    </form>
  )
}
