import type { Metadata } from 'next'

import configPromise from '@payload-config'
import { getPayload } from 'payload'
import Link from 'next/link'
import React from 'react'

import type { Post, Media as MediaType, Tag } from '@/payload-types'
import { Media } from '@/components/Media'

export const metadata: Metadata = {
  title: 'Blog | Sneaker Hedonism',
  description: 'Najnoviji članci i vesti iz sveta patika.',
}

export default async function BlogPage() {
  const payload = await getPayload({ config: configPromise })

  const posts = await payload.find({
    collection: 'posts',
    depth: 1,
    limit: 50,
    overrideAccess: false,
    pagination: false,
    where: {
      _status: { equals: 'published' },
    },
    sort: '-publishedOn',
  })

  return (
    <article className="pt-16 pb-24">
      <div className="container mb-12">
        <h1 className="text-4xl font-bold tracking-tight">Blog</h1>
      </div>

      {posts.docs.length === 0 ? (
        <div className="container">
          <p className="text-muted-foreground">Nema objavljenih članaka.</p>
        </div>
      ) : (
        <div className="container grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {posts.docs.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      )}
    </article>
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
        <h2 className="text-lg font-semibold leading-snug group-hover:text-accent-brand transition-colors">
          {post.title}
        </h2>
        {post.excerpt && (
          <p className="text-sm text-muted-foreground line-clamp-2">{post.excerpt}</p>
        )}
        {date && <time className="mt-auto pt-2 text-xs text-muted-foreground">{date}</time>}
      </div>
    </Link>
  )
}
