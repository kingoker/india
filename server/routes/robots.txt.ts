/**
 * robots.txt с абсолютным адресом sitemap (относительный путь поиковики игнорируют).
 */
export default defineEventHandler((event) => {
  const base = useRuntimeConfig().public.siteUrl
    || `${getRequestHeader(event, 'x-forwarded-proto') || 'https'}://${getRequestHeader(event, 'x-forwarded-host') || getRequestHeader(event, 'host')}`

  setHeader(event, 'Content-Type', 'text/plain; charset=utf-8')
  return `User-agent: *\nAllow: /\nDisallow: /api/\n\nSitemap: ${base}/sitemap.xml\n`
})
