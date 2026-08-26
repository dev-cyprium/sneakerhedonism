// Google only allows /maps/embed to be framed. The older "?q=...&output=embed"
// trick now answers 301 with x-frame-options: SAMEORIGIN, and the browser blocks
// the frame on that redirect — the map just never paints. So whatever an editor
// pastes, normalise it to /maps/embed before it reaches an iframe src.
const ALLOWED_HOSTS = ['google.com', 'www.google.com', 'maps.google.com']

const EMBED_BASE = 'https://www.google.com/maps/embed'

// Google's own "search this query" embed payload — the same shape its redirect
// hands back for a plain address.
const embedFromQuery = (query: string): string =>
  `${EMBED_BASE}?origin=mfe&pb=!1m2!2m1!1s${encodeURIComponent(query)}`

export const resolveMapSrc = (value?: string | null): string | null => {
  if (!value) return null

  const trimmed = value.trim()
  if (!trimmed) return null

  // Pull the src out of a pasted iframe snippet, otherwise treat it as-is.
  const fromIframe = trimmed.match(/<iframe[^>]*\ssrc=["']([^"']+)["']/i)
  const candidate = (fromIframe ? fromIframe[1] : trimmed).trim()

  let url: URL
  try {
    url = new URL(candidate)
  } catch {
    // Not a URL at all — treat a bare address as a place search.
    return /^[\p{L}\p{N}][\p{L}\p{N}\s.,'’\-\/]*$/u.test(candidate)
      ? embedFromQuery(candidate)
      : null
  }

  if (url.protocol !== 'https:') return null
  if (!ALLOWED_HOSTS.includes(url.hostname)) return null

  // Already the framable form — keep every parameter Google generated.
  if (url.pathname.startsWith('/maps/embed')) return url.toString()

  if (!url.pathname.startsWith('/maps')) return null

  // Any other /maps link: recover the place and rebuild it as an embed.
  const query = url.searchParams.get('q') || url.searchParams.get('query')
  if (query) return embedFromQuery(query)

  // ".../maps/place/Some+Place/@44.79,20.46,17z" style links.
  const fromPath = url.pathname.match(/\/maps\/place\/([^/@]+)/)
  if (fromPath) return embedFromQuery(decodeURIComponent(fromPath[1]).replace(/\+/g, ' '))

  return null
}
