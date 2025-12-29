export function JsonLd() {
    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "WebApplication",
        "name": "Gemini Watermark Remover",
        "url": "https://geminiwatermark.ai",
        "start_url": "https://geminiwatermark.ai",
        "applicationCategory": "MultimediaApplication",
        "operatingSystem": "All",
        "browserRequirements": "Requires JavaScript. Requires HTML5.",
        "offers": {
            "@type": "Offer",
            "price": "0",
            "priceCurrency": "USD",
            "category": "Free"
        },
        "description": "Instantly remove Google Gemini & Imagen 3 visible watermarks. Free online AI watermark remover tool. No signup required.",
        "featureList": "Remove Watermark, Batch Processing, High Quality Export",
        "softwareVersion": "1.0",
        "aggregateRating": {
            "@type": "AggregateRating",
            "ratingValue": "4.9",
            "ratingCount": "1250",
            "bestRating": "5",
            "worstRating": "1"
        }
    }

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
    )
}
