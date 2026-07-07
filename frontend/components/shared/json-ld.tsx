const BASE_URL = "https://geminiwatermark.ai"

export function JsonLd() {
    // One @graph keeps entities linked: Organization -> WebSite -> WebApplication
    const jsonLd = {
        "@context": "https://schema.org",
        "@graph": [
            {
                "@type": "Organization",
                "@id": `${BASE_URL}/#organization`,
                "name": "GeminiWatermark.ai",
                "url": BASE_URL,
                "email": "support@geminiwatermark.ai"
            },
            {
                "@type": "WebSite",
                "@id": `${BASE_URL}/#website`,
                "url": BASE_URL,
                "name": "GeminiWatermark.ai",
                "publisher": { "@id": `${BASE_URL}/#organization` }
            },
            {
                "@type": "WebApplication",
                "@id": `${BASE_URL}/#app`,
                "name": "Gemini Watermark Remover",
                "url": BASE_URL,
                "isPartOf": { "@id": `${BASE_URL}/#website` },
                "applicationCategory": "MultimediaApplication",
                "operatingSystem": "Any (web browser)",
                "browserRequirements": "Requires JavaScript. Requires HTML5.",
                "description": "Free online tool that removes the visible Google Gemini watermark from AI-generated images using deterministic reverse alpha blending — no quality loss, no signup. Pro adds batch processing and Veo video watermark removal.",
                "featureList": [
                    "Gemini image watermark removal (Gemini 3.5 and legacy profiles)",
                    "Veo / Gemini video watermark removal (720p & 1080p)",
                    "Batch processing for multiple images",
                    "Original resolution preserved - no recompression",
                    "In-memory processing, files deleted within an hour"
                ],
                "offers": [
                    {
                        "@type": "Offer",
                        "name": "Free",
                        "price": "0",
                        "priceCurrency": "USD",
                        "description": "5 images per day, no signup required"
                    },
                    {
                        "@type": "Offer",
                        "name": "Pro",
                        "price": "4.99",
                        "priceCurrency": "USD",
                        "description": "Unlimited images, batch uploads, Veo video watermark removal (10 videos/day)"
                    }
                ]
            }
        ]
    }

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
    )
}
