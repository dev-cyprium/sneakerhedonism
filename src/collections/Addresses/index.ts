import type { CollectionOverride } from '@payloadcms/plugin-ecommerce/types'

import { syncAddressNameToUser } from './hooks/syncAddressNameToUser'

export const AddressesCollection: CollectionOverride = ({ defaultCollection }) => ({
  ...defaultCollection,
  hooks: {
    ...(defaultCollection.hooks ?? {}),
    afterChange: [...(defaultCollection.hooks?.afterChange ?? []), syncAddressNameToUser],
  },
})
