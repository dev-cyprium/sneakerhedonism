import type { BlogFeedBlock as BlogFeedBlockProps, Post, Media as MediaType, Tag } from '@/payload-types'

import configPromise from '@payload-config'
import { DefaultDocumentIDType, getPayload } from 'payload'
import Link from 'next/link'
import React from 'react'

import { Media } from '@/components/Media'

const SVE_SLUG = 'sve'

export const BlogFeedBlock: React.FC<
  BlogFeedBlockProps & {
    id?: DefaultDocumentIDType
    searchParams?: { category?: string }
  }
> = async ({ id, heading, postsPerPage = 50, searchParams }) => {
  const payload = await getPayload({ config: configPromise })
  const limit = postsPerPage ?? 50
  const category = searchParams?.category ?? SVE_SLUG

  const [tagsResult, postsResult] = await Promise.all([
    payload.find({
      collection: 'tags',
      depth: 0,
      limit: 100,
      overrideAccess: false,
      pagination: false,
      sort: 'title',
    }),
    (async () => {
      const where: { _status: { equals: 'published' }; tags?: { contains: number } } = {
        _status: { equals: 'published' },
      }
      if (category !== SVE_SLUG) {
        const tagBySlug = await payload.find({
          collection: 'tags',
          depth: 0,
          limit: 1,
          overrideAccess: false,
          pagination: false,
          where: { slug: { equals: category } },
        })
        const tagId = tagBySlug.docs[0]?.id
        if (tagId) where.tags = { contains: tagId }
      }
      return payload.find({
        collection: 'posts',
        depth: 1,
        limit,
        overrideAccess: false,
        pagination: false,
        sort: '-publishedOn',
        where,
      })
    })(),
  ])

  const posts = postsResult
  const filterOptions = [
    { slug: SVE_SLUG, title: 'Sve' },
    ...tagsResult.docs.map((t) => ({ slug: (t as { slug?: string }).slug ?? '', title: (t as { title?: string }).title ?? '' })),
  ].filter((o) => o.slug)

  return (
    <section className="my-16" id={`block-${id}`}>
      <div className="container">
        {heading && <h2 className="mb-8 text-4xl font-bold tracking-tight">{heading}</h2>}

        {/* Category filters: "Sve" shows all, others filter by tag */}
        <nav className="mb-8 flex flex-wrap gap-2" aria-label="Filter po kategoriji">
          {filterOptions.map((opt) => (
            <Link
              key={opt.slug}
              href={opt.slug === SVE_SLUG ? '/blog' : `/blog?category=${encodeURIComponent(opt.slug)}`}
              className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                category === opt.slug
                  ? 'bg-accent-brand text-accent-brand-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              {opt.title}
            </Link>
          ))}
        </nav>

        {posts.docs.length === 0 ? (
          <p className="text-muted-foreground">Nema objavljenih članaka.</p>
        ) : (
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {posts.docs.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

function PostCard({ post }: { post: Post }) {
  const image = post.featuredImage as MediaType | undefined
  const tags = (post.tags ?? []) as Tag[]
  const date = post.publishedOn
    ? new Date(post.publishedOn).toLocaleDateString('sr-Latn-RS', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : null

  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group flex flex-col overflow-hidden rounded-lg border border-border bg-card transition-colors hover:border-accent-brand"
    >
      {image && (
        <div className="relative aspect-[16/10] overflow-hidden">
          <Media
            resource={image}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </div>
      )}
      <div className="flex flex-1 flex-col gap-2 p-5">
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <span
                key={tag.id}
                className="rounded-full bg-accent-brand/10 px-2.5 py-0.5 text-xs font-medium text-accent-brand"
              >
                {tag.title}
              </span>
            ))}
          </div>
        )}
        <h3 className="text-lg font-semibold leading-snug transition-colors group-hover:text-accent-brand">
          {post.title}
        </h3>
        {post.excerpt && (
          <p className="line-clamp-2 text-sm text-muted-foreground">{post.excerpt}</p>
        )}
        {date && <time className="mt-auto pt-2 text-xs text-muted-foreground">{date}</time>}
      </div>
    </Link>
  )
}
