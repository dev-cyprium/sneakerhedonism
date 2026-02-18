import { revalidatePath } from 'next/cache'
import type { CollectionAfterChangeHook, CollectionAfterDeleteHook } from 'payload'

const STOREFRONT_PATHS = ['/', '/shop'] as const

const revalidateStorefrontPaths = () => {
  for (const path of STOREFRONT_PATHS) {
    revalidatePath(path)
  }
}

const isRenderTimeRevalidateError = (error: unknown): boolean => {
  if (!(error instanceof Error)) return false

  return (
    error.message.includes('used "revalidatePath') &&
    error.message.includes('during render') &&
    error.message.includes('/admin/[[...segments]]')
  )
}

const revalidateStorefrontPathsSafely = ({
  context,
  event,
  payload,
}: {
  context: Record<string, unknown>
  event: 'changed' | 'deleted'
  payload: {
    logger: {
      info: (message: string) => void
      warn: (message: string) => void
    }
  }
}) => {
  if (context.disableRevalidate) return

  try {
    revalidateStorefrontPaths()
    payload.logger.info(`Storefront data ${event} - revalidating / and /shop`)
  } catch (error) {
    if (isRenderTimeRevalidateError(error)) {
      payload.logger.warn('Skipping storefront revalidation during admin render')
      return
    }

    throw error
  }
}

export const revalidateStorefrontAfterChange: CollectionAfterChangeHook = ({
  doc,
  req: { context, payload },
}) => {
  revalidateStorefrontPathsSafely({ context, event: 'changed', payload })

  return doc
}

export const revalidateStorefrontAfterDelete: CollectionAfterDeleteHook = ({
  doc,
  req: { context, payload },
}) => {
  revalidateStorefrontPathsSafely({ context, event: 'deleted', payload })

  return doc
}
