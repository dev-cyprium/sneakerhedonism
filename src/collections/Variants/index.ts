import type { CollectionOverride } from '@payloadcms/plugin-ecommerce/types'
import { APIError } from 'payload'

export const VariantsCollection: CollectionOverride = ({ defaultCollection }) => ({
  ...defaultCollection,
  fields: [
    ...((defaultCollection.fields ?? []).map((field) => {
      if ('name' in field && field.name === 'options' && field.type === 'relationship') {
        return {
          ...field,
          admin: {
            ...field.admin,
            components: {
              ...field.admin?.components,
              Field: {
                path: '@/components/admin/VariantOptionsSelector#VariantOptionsSelector',
              },
            },
          },
        }
      }

      return field
    }) as NonNullable<typeof defaultCollection.fields>),
    {
      name: 'salePriceInRSD',
      type: 'number',
      admin: {
        description: 'Optional sale price for this variant. When set, variant is shown as on sale.',
        condition: (data) => Boolean(data?.priceInRSD),
      },
      label: 'Sale price (RSD)',
      min: 0,
      required: false,
    },
  ],
  admin: {
    ...defaultCollection?.admin,
    group: 'Ecommerce',
    description:
      'Product variants (size, color, etc.). Orphaned variants can be removed from the list below.',
    components: {
      ...defaultCollection?.admin?.components,
      afterList: ['@/components/admin/UnusedVariantsManager#UnusedVariantsManager'],
    },
  },
  endpoints: [
    ...(Array.isArray(defaultCollection.endpoints) ? defaultCollection.endpoints : []),
    {
      path: '/unused',
      method: 'get',
      handler: async (req) => {
        if (!req.user) {
          throw new APIError('Unauthorized', 401)
        }

        const { docs } = await req.payload.find({
          collection: 'variants',
          where: {
            product: { exists: false },
          },
          depth: 0,
          limit: 500,
        })

        return Response.json({ docs })
      },
    },
  ],
})
