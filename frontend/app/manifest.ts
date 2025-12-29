import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: 'Gemini Watermark Remover',
        short_name: 'NoGeminiWatermark',
        description: 'Remove Google Gemini AI visible watermarks instantly.',
        start_url: '/',
        display: 'standalone',
        background_color: '#000000',
        theme_color: '#3b82f6',
        icons: [
            {
                src: '/favicon.ico',
                sizes: 'any',
                type: 'image/x-icon',
            },
        ],
    }
}
