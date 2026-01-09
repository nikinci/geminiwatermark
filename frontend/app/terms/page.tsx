export default function TermsPage() {
    return (
        <main className="min-h-screen pt-24 pb-12">
            <div className="container mx-auto px-4 max-w-3xl prose prose-invert">
                <h1>Terms of Service</h1>
                <p>Last updated: December 2025</p>

                <h2>1. Acceptance</h2>
                <p>By using GeminiWatermark.ai, you agree to these terms.</p>

                <h2>2. Usage Restrictions</h2>
                <p>
                    You agree not to use this service for any illegal purposes. You must have the right to modify the images you upload.
                </p>

                <h2>3. Disclaimer</h2>
                <p>
                    The service is provided "as is". We make no guarantees about the accuracy or quality of the watermark removal.
                </p>

                <h2>4. Contact</h2>
                <p>
                    For any questions regarding these terms, please contact us at <a href="mailto:hello@geminiwatermark.ai" className="text-accent hover:underline">hello@geminiwatermark.ai</a>.
                </p>
            </div>
        </main>
    )
}
