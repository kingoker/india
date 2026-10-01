/**
 * Простой sitemap.xml (ТЗ §7). На этапе с реальными данными
 * динамические маршруты стоит строить из Supabase.
 */
export default defineEventHandler((event) => {
  const base = useRuntimeConfig().public.siteUrl
    || `${getRequestHeader(event, 'x-forwarded-proto') || 'https'}://${getRequestHeader(event, 'x-forwarded-host') || getRequestHeader(event, 'host')}`

  const routes = ['/', '/yagyi', '/tury', '/o-nas', '/docs/privacy', '/docs/consent', '/docs/cookies', '/docs/terms']

  const urls = routes.map(path => `  <url><loc>${base}${path}</loc></url>`).join('\n')
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`

  setHeader(event, 'Content-Type', 'application/xml')
  return xml
})
