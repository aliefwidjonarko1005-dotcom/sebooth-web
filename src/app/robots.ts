import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.sebooth.in'

  return {
    // One group for every crawler: a separate Googlebot group would replace this list, not extend it.
    // Personal pages (/access, /profile, queue tickets) also send noindex in their metadata.
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin', '/api/', '/profile', '/login', '/register'],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}
