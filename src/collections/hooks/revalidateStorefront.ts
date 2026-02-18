import { revalidatePath } from 'next/cache'
import type { CollectionAfterChangeHook, CollectionAfterDeleteHook } from 'payload'

const STOREFRONT_PATHS = ['/', '/shop'] as const

const revalidateStorefrontPaths = () => {
  for (const path of STOREFRONT_PATHS) {
    revalidatePath(path)
  }
}

export const revalidateStorefrontAfterChange: CollectionAfterChangeHook = ({
  doc,
  req: { context, payload },
}) => {
  if (!context.disableRevalidate) {
    payload.logger.info('Storefront data changed - revalidating / and /shop')
    revalidateStorefrontPaths()
  }

  return doc
}

export const revalidateStorefrontAfterDelete: CollectionAfterDeleteHook = ({
  doc,
  req: { context, payload },
}) => {
  if (!context.disableRevalidate) {
    payload.logger.info('Storefront data deleted - revalidating / and /shop')
    revalidateStorefrontPaths()
  }

  return doc
}
