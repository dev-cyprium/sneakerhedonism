import { describe, it, expect } from 'vitest'

import { cn } from '@/utilities/cn'
import { toKebabCase } from '@/utilities/toKebabCase'
import { capitaliseFirstLetter } from '@/utilities/capitaliseFirstLetter'
import { isObject, deepMerge } from '@/utilities/deepMerge'
import { ensureStartsWith } from '@/utilities/ensureStartsWith'
import { formatDateTime } from '@/utilities/formatDateTime'
import { createUrl } from '@/utilities/createUrl'
import { mergeOpenGraph } from '@/utilities/mergeOpenGraph'

// ---------------------------------------------------------------------------
// cn (clsx + tailwind-merge)
// ---------------------------------------------------------------------------
describe('cn', () => {
  it('merges class names', () => {
    expect(cn('foo', 'bar')).toBe('foo bar')
  })

  it('handles conditional classes', () => {
    expect(cn('base', false && 'hidden', 'extra')).toBe('base extra')
  })

  it('deduplicates conflicting tailwind classes', () => {
    expect(cn('p-4', 'p-2')).toBe('p-2')
  })

  it('returns empty string for no inputs', () => {
    expect(cn()).toBe('')
  })

  it('handles arrays', () => {
    expect(cn(['a', 'b'], 'c')).toBe('a b c')
  })
})

// ---------------------------------------------------------------------------
// toKebabCase
// ---------------------------------------------------------------------------
describe('toKebabCase', () => {
  it('converts camelCase', () => {
    expect(toKebabCase('camelCase')).toBe('camel-case')
  })

  it('converts PascalCase', () => {
    expect(toKebabCase('PascalCaseString')).toBe('pascal-case-string')
  })

  it('converts spaces', () => {
    expect(toKebabCase('hello world')).toBe('hello-world')
  })

  it('converts multiple spaces', () => {
    expect(toKebabCase('hello   world')).toBe('hello-world')
  })

  it('lowercases the result', () => {
    expect(toKebabCase('HELLO')).toBe('hello')
  })

  it('handles already kebab-case', () => {
    expect(toKebabCase('already-kebab')).toBe('already-kebab')
  })
})

// ---------------------------------------------------------------------------
// capitaliseFirstLetter
// ---------------------------------------------------------------------------
describe('capitaliseFirstLetter', () => {
  it('capitalises the first letter', () => {
    expect(capitaliseFirstLetter('hello')).toBe('Hello')
  })

  it('returns empty string for empty input', () => {
    expect(capitaliseFirstLetter('')).toBe('')
  })

  it('leaves already capitalised strings', () => {
    expect(capitaliseFirstLetter('Hello')).toBe('Hello')
  })

  it('only affects the first character', () => {
    expect(capitaliseFirstLetter('hELLO')).toBe('HELLO')
  })

  it('handles single character', () => {
    expect(capitaliseFirstLetter('a')).toBe('A')
  })
})

// ---------------------------------------------------------------------------
// isObject / deepMerge
// ---------------------------------------------------------------------------
describe('isObject', () => {
  it('returns true for plain objects', () => {
    expect(isObject({})).toBe(true)
    expect(isObject({ a: 1 })).toBe(true)
  })

  it('returns false for arrays', () => {
    expect(isObject([])).toBe(false)
  })

  it('returns falsy for primitives', () => {
    expect(isObject(null)).toBeFalsy()
    expect(isObject(undefined)).toBeFalsy()
    expect(isObject(42)).toBeFalsy()
    expect(isObject('str')).toBeFalsy()
  })
})

describe('deepMerge', () => {
  it('merges flat objects', () => {
    expect(deepMerge({ a: 1 }, { b: 2 })).toEqual({ a: 1, b: 2 })
  })

  it('overrides matching keys', () => {
    expect(deepMerge({ a: 1 }, { a: 2 })).toEqual({ a: 2 })
  })

  it('deeply merges nested objects', () => {
    const target = { nested: { a: 1, b: 2 } }
    const source = { nested: { b: 3, c: 4 } }
    expect(deepMerge(target, source)).toEqual({ nested: { a: 1, b: 3, c: 4 } })
  })

  it('does not mutate the target', () => {
    const target = { a: 1 }
    const result = deepMerge(target, { b: 2 })
    expect(target).toEqual({ a: 1 })
    expect(result).toEqual({ a: 1, b: 2 })
  })

  it('handles source with new nested key', () => {
    expect(deepMerge({ a: 1 }, { nested: { x: 1 } })).toEqual({ a: 1, nested: { x: 1 } })
  })
})

// ---------------------------------------------------------------------------
// ensureStartsWith
// ---------------------------------------------------------------------------
describe('ensureStartsWith', () => {
  it('adds prefix when missing', () => {
    expect(ensureStartsWith('example.com', 'https://')).toBe('https://example.com')
  })

  it('does not duplicate prefix when present', () => {
    expect(ensureStartsWith('https://example.com', 'https://')).toBe('https://example.com')
  })

  it('handles slash prefix', () => {
    expect(ensureStartsWith('path', '/')).toBe('/path')
    expect(ensureStartsWith('/path', '/')).toBe('/path')
  })
})

// ---------------------------------------------------------------------------
// formatDateTime
// ---------------------------------------------------------------------------
describe('formatDateTime', () => {
  it('formats with default dd/MM/yyyy format', () => {
    expect(formatDateTime({ date: '2024-03-15T12:00:00Z' })).toBe('15/03/2024')
  })

  it('formats with custom format', () => {
    expect(formatDateTime({ date: '2024-03-15T12:00:00Z', format: 'yyyy-MM-dd' })).toBe(
      '2024-03-15',
    )
  })

  it('returns empty string for empty date', () => {
    expect(formatDateTime({ date: '' })).toBe('')
  })
})

// ---------------------------------------------------------------------------
// createUrl
// ---------------------------------------------------------------------------
describe('createUrl', () => {
  it('creates URL with params', () => {
    const params = new URLSearchParams({ q: 'shoes', size: '42' })
    expect(createUrl('/shop', params)).toBe('/shop?q=shoes&size=42')
  })

  it('creates URL without params', () => {
    const params = new URLSearchParams()
    expect(createUrl('/shop', params)).toBe('/shop')
  })
})

// ---------------------------------------------------------------------------
// mergeOpenGraph
// ---------------------------------------------------------------------------
describe('mergeOpenGraph', () => {
  it('returns defaults when no arg provided', () => {
    const result = mergeOpenGraph()
    expect(result).toHaveProperty('type', 'website')
    expect(result).toHaveProperty('siteName', 'Payload Website Template')
  })

  it('overrides title and description', () => {
    const result = mergeOpenGraph({ title: 'Custom', description: 'My desc' })
    expect(result).toHaveProperty('title', 'Custom')
    expect(result).toHaveProperty('description', 'My desc')
  })

  it('uses custom images when provided', () => {
    const customImages = [{ url: 'https://example.com/og.png' }]
    const result = mergeOpenGraph({ images: customImages })
    expect(result?.images).toEqual(customImages)
  })

  it('uses default images when none provided', () => {
    const result = mergeOpenGraph({ title: 'No images' })
    expect(result?.images).toEqual([{ url: 'https://payloadcms.com/images/og-image.jpg' }])
  })
})
