'use client'

import type { Form as FormType } from '@payloadcms/plugin-form-builder/types'
import type { DefaultDocumentIDType } from 'payload'

import React, { useCallback, useState } from 'react'
import { useForm, FormProvider } from 'react-hook-form'

import { buildInitialFormState } from '@/blocks/Form/buildInitialFormState'
import { fields } from '@/blocks/Form/fields'
import { getClientSideURL } from '@/utilities/getURL'
import { RichText } from '@/components/RichText'

export type NewsletterBlockProps = {
  blockName?: string
  blockType?: 'newsletter'
  heading?: string
  description?: string
  form: FormType
  id?: DefaultDocumentIDType
}

export const NewsletterBlock: React.FC<NewsletterBlockProps> = (props) => {
  const {
    heading,
    description,
    form: formFromProps,
    form: { id: formID, confirmationMessage, confirmationType } = {},
  } = props

  const formMethods = useForm({
    defaultValues: buildInitialFormState(formFromProps.fields),
  })
  const {
    control,
    formState: { errors },
    handleSubmit,
    register,
  } = formMethods

  const [isLoading, setIsLoading] = useState(false)
  const [hasSubmitted, setHasSubmitted] = useState(false)
  const [error, setError] = useState<{ message: string; status?: string }>()

  const onSubmit = useCallback(
    (data: Record<string, unknown>) => {
      const submitForm = async () => {
        setError(undefined)

        const dataToSend = Object.entries(data).map(([name, value]) => ({
          field: name,
          value,
        }))

        setIsLoading(true)

        try {
          const req = await fetch(`${getClientSideURL()}/api/form-submissions`, {
            body: JSON.stringify({
              form: formID,
              submissionData: dataToSend,
            }),
            headers: { 'Content-Type': 'application/json' },
            method: 'POST',
          })

          const res = await req.json()

          if (req.status >= 400) {
            setIsLoading(false)
            setError({
              message: res.errors?.[0]?.message || 'Internal Server Error',
              status: res.status,
            })
            return
          }

          setIsLoading(false)
          setHasSubmitted(true)
        } catch (err) {
          console.warn(err)
          setIsLoading(false)
          setError({ message: 'Something went wrong.' })
        }
      }

      void submitForm()
    },
    [formID],
  )

  return (
    <section className="bg-dropdown-bg py-16 md:py-24 overflow-hidden">
      <div className="mx-auto max-w-xl px-4">
        {!hasSubmitted ? (
          <>
            {heading && (
              <h2 className="text-accent-brand text-2xl md:text-3xl font-bold mb-4">
                {heading}
              </h2>
            )}
            {description && (
              <p className="text-white/90 text-base md:text-lg mb-10">{description}</p>
            )}

            <FormProvider {...formMethods}>
              {error && (
                <div className="text-red-400 mb-4">
                  {`${error.status || '500'}: ${error.message}`}
                </div>
              )}
              <form id={formID} onSubmit={handleSubmit(onSubmit)} className="space-y-3">
                {formFromProps?.fields?.map((field, index) => {
                  const Field: React.FC<any> | undefined =
                    fields?.[field.blockType as keyof typeof fields]

                  if (Field) {
                    return (
                      <div key={index} className="[&_label]:sr-only [&_input]:rounded-full [&_input]:border-0 [&_input]:py-2 [&_input]:px-4 [&_input]:text-sm [&_input]:h-10">
                        <Field
                          form={formFromProps}
                          {...field}
                          {...formMethods}
                          control={control}
                          errors={errors}
                          register={register}
                        />
                      </div>
                    )
                  }
                  return null
                })}

                <div className="text-center">
                  <button
                    type="submit"
                    form={formID}
                    disabled={isLoading}
                    className="bg-accent-brand hover:bg-accent-brand/90 text-white font-semibold rounded-full px-8 py-2.5 text-sm transition-colors disabled:opacity-50"
                  >
                    {isLoading ? 'Slanje...' : formFromProps.submitButtonLabel || 'Prijavi se'}
                  </button>
                </div>
              </form>
            </FormProvider>
          </>
        ) : (
          <div className="text-white">
            {confirmationType === 'message' && confirmationMessage ? (
              <RichText data={confirmationMessage} />
            ) : (
              <p className="text-xl font-semibold">Hvala na prijavi!</p>
            )}
          </div>
        )}
      </div>
    </section>
  )
}
