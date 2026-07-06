import { MetadataRoute } from 'next'

// AI/LLM crawlers are explicitly welcomed: being retrievable and citable by
// ChatGPT, Claude, Perplexity, Gemini & co. is a traffic channel (GEO).
const AI_CRAWLERS = [
    'GPTBot',
    'OAI-SearchBot',
    'ChatGPT-User',
    'ClaudeBot',
    'Claude-User',
    'Claude-SearchBot',
    'PerplexityBot',
    'Perplexity-User',
    'Google-Extended',
    'Applebot-Extended',
    'meta-externalagent',
    'Amazonbot',
    'cohere-ai',
    'CCBot',
]

const DISALLOW = ['/api/', '/profile', '/auth/']

export default function robots(): MetadataRoute.Robots {
    return {
        rules: [
            {
                userAgent: '*',
                allow: '/',
                disallow: DISALLOW,
            },
            ...AI_CRAWLERS.map(bot => ({
                userAgent: bot,
                allow: '/',
                disallow: DISALLOW,
            })),
        ],
        sitemap: 'https://geminiwatermark.ai/sitemap.xml',
        host: 'https://geminiwatermark.ai',
    }
}
