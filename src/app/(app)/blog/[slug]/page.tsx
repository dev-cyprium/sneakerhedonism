import type { Metadata } from 'next'

import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { draftMode } from 'next/headers'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import React from 'react'
import { Search } from 'lucide-react'

import type { Post, Media as MediaType, Tag, User } from '@/payload-types'
import { Media } from '@/components/Media'
import { RichText } from '@/components/RichText'
import { generateMeta } from '@/utilities/generateMeta'
import { ShareButtons } from './ShareButtons'

export async function generateStaticParams() {
  const payload = await getPayload({ config: configPromise })
  const posts = await payload.find({
    collection: 'posts',
    draft: false,
    limit: 1000,
    overrideAccess: false,
    pagination: false,
    select: {
      slug: true,
    },
  })

  return posts.docs.map(({ slug }) => ({ slug }))
}

type Args = {
  params: Promise<{ slug: string }>
}

export default async function BlogPostPage({ params }: Args) {
  const { slug } = await params
  const post = await queryPostBySlug({ slug })

  if (!post) return notFound()

  const image = post.featuredImage as MediaType | undefined
  const author = post.author as User | undefined
  const tags = (post.tags ?? []) as Tag[]
  const date = post.publishedOn
    ? new Date(post.publishedOn).toLocaleDateString('sr-Latn-RS', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : null

  const payload = await getPayload({ config: configPromise })
  const { docs: recentPosts } = await payload.find({
    collection: 'posts',
    depth: 1,
    limit: 5,
    sort: '-publishedOn',
    where: {
      and: [
        { _status: { equals: 'published' } },
        { id: { not_equals: post.id } },
      ],
    },
  })

  return (
    <article className="pb-24">
      {/* Title + meta above the image */}
      <div className="container max-w-4xl mx-auto pt-10">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl leading-tight">
          {post.title}
        </h1>

        {/* Meta row */}
        <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
          {author?.name && <span>{author.name}</span>}
          {author?.name && date && <span aria-hidden="true">&middot;</span>}
          {date && <time>{date}</time>}
        </div>

        {/* Tags */}
        {tags.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
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
      </div>

      {/* Featured image — centered, smaller, rounded */}
      {image && (
        <div className="container max-w-xl mx-auto mt-8">
          <div className="relative aspect-[16/9] overflow-hidden rounded-2xl">
            <Media
              resource={image}
              className="absolute inset-0"
              imgClassName="h-full w-full object-cover"
              fill
            />
          </div>
        </div>
      )}

      {/* 2-column layout */}
      <div className="container mx-auto mt-10">
        <div className="flex flex-col lg:flex-row gap-10">
          {/* Left column — content */}
          <div className="flex-1 min-w-0 max-w-3xl">
            <hr className="border-border mb-8" />

            {post.content && (
              <div className="blog-prose">
                <RichText data={post.content} enableGutter={false} />
              </div>
            )}

            {/* Share icons */}
            <hr className="border-border mt-10 mb-6" />
            <ShareButtons title={post.title} />
          </div>

          {/* Right column — sidebar (sticky) */}
          <aside className="w-full lg:w-72 shrink-0">
            <div className="lg:sticky lg:top-28 space-y-8">
              {/* Search */}
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wide mb-3">Pretraga</h3>
                <form action="/blog" method="GET" className="relative">
                  <input
                    type="text"
                    name="search"
                    placeholder="Pretraži blog..."
                    className="w-full rounded-lg border border-border bg-background px-4 py-2.5 pr-10 text-sm placeholder:text-muted-foreground focus:border-accent-brand focus:outline-none focus:ring-1 focus:ring-accent-brand"
                  />
                  <button
                    type="submit"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    aria-label="Pretraži"
                  >
                    <Search className="size-4" />
                  </button>
                </form>
              </div>

              {/* Recent articles */}
              {recentPosts.length > 0 && (
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-wide mb-3">Najnovije objave</h3>
                  <ul className="space-y-4">
                    {recentPosts.map((recent) => {
                      const recentImage = recent.featuredImage as MediaType | undefined
                      const recentDate = recent.publishedOn
                        ? new Date(recent.publishedOn).toLocaleDateString('sr-Latn-RS', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })
                        : null

                      return (
                        <li key={recent.id}>
                          <Link
                            href={`/blog/${recent.slug}`}
                            className="group flex gap-3 items-start"
                          >
                            {recentImage && (
                              <div className="relative size-16 shrink-0 overflow-hidden rounded-md">
                                <Media
                                  resource={recentImage}
                                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                                />
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium leading-snug line-clamp-2 group-hover:text-accent-brand transition-colors">
                                {recent.title}
                              </p>
                              {recentDate && (
                                <time className="text-xs text-muted-foreground mt-1 block">
                                  {recentDate}
                                </time>
                              )}
                            </div>
                          </Link>
                        </li>
                      )
                    })}
                  </ul>
                </div>
              )}
            </div>
          </aside>
        </div>
      </div>
    </article>
  )
}

export async function generateMetadata({ params }: Args): Promise<Metadata> {
  const { slug } = await params
  const post = await queryPostBySlug({ slug })

  return generateMeta({ doc: post })
}

const queryPostBySlug = async ({ slug }: { slug: string }) => {
  const { isEnabled: draft } = await draftMode()

  const payload = await getPayload({ config: configPromise })

  const result = await payload.find({
    collection: 'posts',
    draft,
    limit: 1,
    depth: 2,
    overrideAccess: draft,
    pagination: false,
    where: {
      and: [
        { slug: { equals: slug } },
        ...(draft ? [] : [{ _status: { equals: 'published' as const } }]),
      ],
    },
  })

  return result.docs?.[0] || null
}
