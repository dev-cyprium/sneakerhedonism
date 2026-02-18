import { revalidateTag } from 'next/cache'
import { slugField } from 'payload'
import type { CollectionAfterChangeHook, CollectionAfterDeleteHook, CollectionConfig, Where } from 'payload'

import {
  revalidateStorefrontAfterChange,
  revalidateStorefrontAfterDelete,
} from '@/collections/hooks/revalidateStorefront'

const revalidateHeaderOnChange: CollectionAfterChangeHook = ({ req: { payload } }) => {
  payload.logger.info('Category changed — revalidating header')
  revalidateTag('global_header', { expire: 0 })
}

const revalidateHeaderOnDelete: CollectionAfterDeleteHook = ({ req: { payload } }) => {
  payload.logger.info('Category deleted — revalidating header')
  revalidateTag('global_header', { expire: 0 })
}

export const Categories: CollectionConfig = {
  slug: 'categories',
  access: {
    read: () => true,
  },
  admin: {
    useAsTitle: 'title',
    group: 'Content',
  },
  hooks: {
    afterChange: [revalidateHeaderOnChange, revalidateStorefrontAfterChange],
    afterDelete: [revalidateHeaderOnDelete, revalidateStorefrontAfterDelete],
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'parent',
      type: 'relationship',
      relationTo: 'categories',
      label: 'Parent Category',
      admin: {
        position: 'sidebar',
        description: 'Leave empty for top-level categories',
      },
      filterOptions: ({ id }) => {
        const filter: Where = {
          parent: { exists: false },
        }
        if (id) {
          filter.id = { not_equals: id }
        }
        return filter
      },
    },
    {
      name: 'isNew',
      type: 'checkbox',
      label: 'Mark as NEW',
      defaultValue: false,
      admin: {
        position: 'sidebar',
        description: 'Shows a "NEW" badge in navigation',
      },
    },
    slugField({
      position: undefined,
    }),
  ],
}
