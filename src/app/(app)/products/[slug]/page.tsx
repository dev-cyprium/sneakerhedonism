import type { Category, Media, Product } from '@/payload-types'

import { RenderBlocks } from '@/blocks/RenderBlocks'
import { Gallery } from '@/components/product/Gallery'
import { ProductDescription } from '@/components/product/ProductDescription'
import { ProductGridItem } from '@/components/ProductGridItem'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { draftMode } from 'next/headers'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import React, { Suspense } from 'react'
import { Metadata } from 'next'
import { RichText } from '@/components/RichText'
import { ChevronRight } from 'lucide-react'

type Args = {
  params: Promise<{
    slug: string
  }>
}

export async function generateMetadata({ params }: Args): Promise<Metadata> {
  const { slug } = await params
  const product = await queryProductBySlug({ slug })

  if (!product) return notFound()

  const gallery = product.gallery?.filter((item) => typeof item.image === 'object') || []

  const metaImage = typeof product.meta?.image === 'object' ? product.meta?.image : undefined
  const canIndex = product._status === 'published'

  const seoImage = metaImage || (gallery.length ? (gallery[0]?.image as Media) : undefined)

  return {
    description: product.meta?.description || '',
    openGraph: seoImage?.url
      ? {
          images: [
            {
              alt: seoImage?.alt,
              height: seoImage.height!,
              url: seoImage?.url,
              width: seoImage.width!,
            },
          ],
        }
      : null,
    robots: {
      follow: canIndex,
      googleBot: {
        follow: canIndex,
        index: canIndex,
      },
      index: canIndex,
    },
    title: product.meta?.title || product.title,
  }
}

export default async function ProductPage({ params }: Args) {
  const { slug } = await params
  const product = await queryProductBySlug({ slug })

  if (!product) return notFound()

  const gallery =
    product.gallery
      ?.filter((item) => typeof item.image === 'object')
      .map((item) => ({
        ...item,
        image: item.image as Media,
      })) || []

  const metaImage = typeof product.meta?.image === 'object' ? product.meta?.image : undefined
  const hasStock = product.enableVariants
    ? product?.variants?.docs?.some((variant) => {
        if (typeof variant !== 'object') return false
        return variant.inventory && variant?.inventory > 0
      })
    : product.inventory! > 0

  let price = product.priceInRSD

  if (product.enableVariants && product?.variants?.docs?.length) {
    price = product?.variants?.docs?.reduce((acc, variant) => {
      if (typeof variant === 'object' && variant?.priceInRSD && acc && variant?.priceInRSD > acc) {
        return variant.priceInRSD
      }
      return acc
    }, price)
  }

  const productJsonLd = {
    name: product.title,
    '@context': 'https://schema.org',
    '@type': 'Product',
    description: product.description,
    image: metaImage?.url,
    offers: {
      '@type': 'AggregateOffer',
      availability: hasStock ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      price: price,
      priceCurrency: 'RSD',
    },
  }

  const relatedProducts =
    product.relatedProducts?.filter((relatedProduct) => typeof relatedProduct === 'object') ?? []

  const categories = product.categories?.filter(
    (cat): cat is Category => typeof cat === 'object',
  )

  return (
    <React.Fragment>
      <script
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(productJsonLd),
        }}
        type="application/ld+json"
      />
      <div className="container pt-6 pb-8">
        {/* Breadcrumbs */}
        <Breadcrumbs categories={categories} productTitle={product.title} />

        {/* Main product area */}
        <div className="flex flex-col gap-8 lg:flex-row lg:gap-12 mt-6">
          <div className="w-full lg:w-1/2">
            <Suspense
              fallback={
                <div className="relative aspect-square h-full max-h-[550px] w-full overflow-hidden" />
              }
            >
              {Boolean(gallery?.length) && <Gallery gallery={gallery} />}
            </Suspense>
          </div>

          <div className="w-full lg:w-1/2">
            <ProductDescription product={product} />
          </div>
        </div>

        {/* Description section */}
        {product.description && (
          <div className="mt-12 border-t pt-8">
            <h2 className="text-lg font-semibold mb-4 uppercase tracking-wide">Description</h2>
            <RichText
              className="prose max-w-none text-sm text-muted-foreground"
              data={product.description}
              enableGutter={false}
            />
          </div>
        )}
      </div>

      {product.layout?.length ? <RenderBlocks blocks={product.layout} /> : <></>}

      {relatedProducts.length ? (
        <div className="container pb-12">
          <RelatedProducts products={relatedProducts as Product[]} />
        </div>
      ) : (
        <></>
      )}
    </React.Fragment>
  )
}

function Breadcrumbs({
  categories,
  productTitle,
}: {
  categories?: Category[]
  productTitle: string
}) {
  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-1 text-sm text-muted-foreground flex-wrap">
      <Link href="/" className="hover:text-foreground transition-colors">
        Home
      </Link>
      {categories?.map((cat) => {
        const parent =
          cat.parent && typeof cat.parent === 'object' ? (cat.parent as Category) : null
        return (
          <React.Fragment key={cat.id}>
            {parent && (
              <>
                <ChevronRight className="size-3.5" />
                <Link
                  href={`/shop?category=${parent.slug}`}
                  className="hover:text-foreground transition-colors"
                >
                  {parent.title}
                </Link>
              </>
            )}
            <ChevronRight className="size-3.5" />
            <Link
              href={`/shop?category=${cat.slug}`}
              className="hover:text-foreground transition-colors"
            >
              {cat.title}
            </Link>
          </React.Fragment>
        )
      })}
      <ChevronRight className="size-3.5" />
      <span className="text-foreground font-medium">{productTitle}</span>
    </nav>
  )
}

function RelatedProducts({ products }: { products: Product[] }) {
  if (!products.length) return null

  return (
    <div className="border-t pt-8">
      <h2 className="mb-6 text-lg font-semibold uppercase tracking-wide">Related Products</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {products.slice(0, 4).map((product) => (
          <ProductGridItem key={product.id} product={product} />
        ))}
      </div>
    </div>
  )
}

const queryProductBySlug = async ({ slug }: { slug: string }) => {
  const { isEnabled: draft } = await draftMode()

  const payload = await getPayload({ config: configPromise })

  const result = await payload.find({
    collection: 'products',
    depth: 3,
    draft,
    limit: 1,
    overrideAccess: draft,
    pagination: false,
    where: {
      and: [
        {
          slug: {
            equals: slug,
          },
        },
        ...(draft ? [] : [{ _status: { equals: 'published' } }]),
      ],
    },
    populate: {
      variants: {
        title: true,
        priceInRSD: true,
        inventory: true,
        options: true,
      },
    },
  })

  return result.docs?.[0] || null
}
