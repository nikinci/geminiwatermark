import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
    return {
        rules: [
            {
                userAgent: '*',
                allow: '/',
                disallow: ['/private/', '/api/'],
            },
        ],
        sitemap: 'https://geminiwatermark.ai/sitemap.xml',
        host: 'https://geminiwatermark.ai',
    }
}
