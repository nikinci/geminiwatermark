import { Metadata } from "next"

export const metadata: Metadata = {
    title: "Features - Gemini Watermark Remover",
    description: "Learn about our advanced AI technology for removing visible and invisible watermarks from Gemini and Imagen 3 images.",
}

export default function FeaturesPage() {
    return (
        <main className="min-h-screen pt-24 pb-12">
            <div className="container mx-auto px-4">
                <div className="max-w-4xl mx-auto space-y-12">
                    <div className="text-center space-y-4">
                        <h1 className="text-4xl font-bold">Advanced Removal Technology</h1>
                        <p className="text-xl text-muted-foreground">
                            Built specifically for the next generation of AI-generated content.
                        </p>
                    </div>

                    <div className="grid gap-8 md:grid-cols-2">
                        <div className="p-8 rounded-2xl bg-card border border-border">
                            <h3 className="text-2xl font-bold mb-4">Visible Watermark Removal</h3>
                            <p className="text-muted-foreground">
                                Our models are training to specifically target the visible "Gemini" logo and branding often found in the corners of generated images, ensuring a clean look for your content.
                            </p>
                        </div>
                        <div className="p-8 rounded-2xl bg-card border border-border">
                            <h3 className="text-2xl font-bold mb-4">Reverse Alpha Blending</h3>
                            <p className="text-muted-foreground">
                                For visible text watermarks, we use context-aware inpainting and reverse alpha blending to mathematically subtract the watermark layer while reconstructing the underlying details.
                            </p>
                        </div>
                        <div className="p-8 rounded-2xl bg-card border border-border">
                            <h3 className="text-2xl font-bold mb-4">Privacy First</h3>
                            <p className="text-muted-foreground">
                                We employ a stateless processing architecture. Your images are uploaded to ephemeral RAM storage, processed instantly, and wipes from memory. We never write your user content to disk.
                            </p>
                        </div>
                        <div className="p-8 rounded-2xl bg-card border border-border">
                            <h3 className="text-2xl font-bold mb-4">Lossless Output</h3>
                            <p className="text-muted-foreground">
                                Supports PNG and WebP output to ensure no generation loss. What you upload is what you get back—minus the watermark.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    )
}
