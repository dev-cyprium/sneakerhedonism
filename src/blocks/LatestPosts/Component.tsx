import type { LatestPostsBlock as LatestPostsBlockProps, Post, Media as MediaType, Tag } from '@/payload-types'

import configPromise from '@payload-config'
import { DefaultDocumentIDType, getPayload } from 'payload'
import Link from 'next/link'
import React from 'react'
import { Media } from '@/components/Media'

export const LatestPostsBlock: React.FC<
  LatestPostsBlockProps & {
    id?: DefaultDocumentIDType
  }
> = async ({ id, heading }) => {
  const payload = await getPayload({ config: configPromise })

  const { docs: posts } = await payload.find({
    collection: 'posts',
    depth: 1,
    limit: 3,
    sort: '-publishedOn',
    where: {
      _status: { equals: 'published' },
    },
  })

  if (posts.length === 0) return null

  return (
    <section className="my-16" id={`block-${id}`}>
      <div className="container">
        {heading && <h2 className="mb-8 text-2xl font-bold tracking-tight">{heading}</h2>}

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>

        <div className="mt-8 text-center">
          <Link
            href="/blog"
            className="inline-block text-sm font-medium text-accent-brand hover:underline"
          >
            Pogledaj sve članke &rarr;
          </Link>
        </div>
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
        <h3 className="text-lg font-semibold leading-snug group-hover:text-accent-brand transition-colors">
          {post.title}
        </h3>
        {post.excerpt && (
          <p className="text-sm text-muted-foreground line-clamp-2">{post.excerpt}</p>
        )}
        {date && <time className="mt-auto pt-2 text-xs text-muted-foreground">{date}</time>}
      </div>
    </Link>
  )
}
