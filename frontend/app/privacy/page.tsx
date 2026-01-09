export default function PrivacyPage() {
    return (
        <main className="min-h-screen pt-24 pb-12">
            <div className="container mx-auto px-4 max-w-3xl prose prose-invert">
                <h1>Privacy Policy</h1>
                <p>Last updated: December 2025</p>

                <h2>1. Image Processing</h2>
                <p>
                    Images uploaded to GeminiWatermark.ai are processed in-memory.
                    We do not store, retain, or share your uploaded images.
                    Once the processing is complete and the result is returned to you, the original and processed images are immediately discarded from our servers.
                </p>

                <h2>2. Data Collection</h2>
                <p>
                    We do not require user accounts. We may collect anonymous usage statistics (e.g., number of images processed) and standard web analytics to improve our service.
                </p>

                <h2>3. Local Storage</h2>
                <p>
                    We use local storage on your device to track your daily free usage limit. No personal data is stored in cookies.
                </p>

                <h2>4. Contact Us</h2>
                <p>
                    If you have questions about this policy, please contact us at <a href="mailto:hello@geminiwatermark.ai" className="text-accent hover:underline">hello@geminiwatermark.ai</a>.
                </p>
            </div>
        </main>
    )
}
