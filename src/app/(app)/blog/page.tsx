import type { Metadata } from 'next'

import { RenderBlocks } from '@/blocks/RenderBlocks'
import { RenderHero } from '@/heros/RenderHero'
import { generateMeta } from '@/utilities/generateMeta'
import configPromise from '@payload-config'
import { draftMode } from 'next/headers'
import { getPayload } from 'payload'

import { notFound } from 'next/navigation'

const BLOG_PAGE_SLUG = 'blog'

type BlogPageProps = {
  searchParams: Promise<{ category?: string }>
}

export default async function BlogPage({ searchParams: searchParamsPromise }: BlogPageProps) {
  const page = await queryPageBySlug({ slug: BLOG_PAGE_SLUG })
  const searchParams = await searchParamsPromise

  if (!page) {
    return notFound()
  }

  const { hero, layout } = page

  return (
    <article className="pt-16 pb-24">
      <RenderHero {...hero} />
      <RenderBlocks blocks={layout} searchParams={searchParams} />
    </article>
  )
}

export async function generateMetadata(): Promise<Metadata> {
  const page = await queryPageBySlug({ slug: BLOG_PAGE_SLUG })
  return generateMeta({ doc: page })
}

const queryPageBySlug = async ({ slug }: { slug: string }) => {
  const { isEnabled: draft } = await draftMode()

  const payload = await getPayload({ config: configPromise })

  const result = await payload.find({
    collection: 'pages',
    depth: 2,
    draft,
    limit: 1,
    overrideAccess: draft,
    pagination: false,
    where: {
      and: [{ slug: { equals: slug } }, ...(draft ? [] : [{ _status: { equals: 'published' } }])],
    },
  })

  return result.docs?.[0] || null
}
