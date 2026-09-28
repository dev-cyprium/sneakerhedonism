import config from '@payload-config'
import { getPayload } from 'payload'

export const dynamic = 'force-dynamic'
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const payload = await getPayload({ config })
  const result = await payload.find({
    collection: 'products',
    overrideAccess: false,
    draft: false,
    depth: 1,
    where: { and: [{ id: { equals: id } }, { _status: { equals: 'published' } }] },
    select: { inventory: true, enableVariants: true, variants: true },
    limit: 1,
    joins: { variants: { limit: 1000, where: { _status: { equals: 'published' } } } },
  })
  const product = result.docs[0]
  return Response.json(
    product
      ? {
          inventory: product.inventory ?? 0,
          variants: (product.variants?.docs ?? []).flatMap((v) =>
            typeof v === 'object' ? [{ id: v.id, inventory: v.inventory ?? 0 }] : [],
          ),
        }
      : { inventory: 0, variants: [] },
    {
      status: product ? 200 : 404,
      headers: { 'Cache-Control': 'no-store' },
    },
  )
}
