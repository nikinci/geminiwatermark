import { Metadata } from "next"

export const metadata: Metadata = {
    title: "Features - Gemini Watermark Remover",
    description: "Learn about our advanced AI technology for removing visible and invisible watermarks from Gemini and Imagen 3 images.",
}

import { FEATURES } from "@/lib/features-data"
import Link from "next/link"
import { ArrowRight } from "lucide-react"

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
                        {FEATURES.map((feature) => (
                            <Link
                                key={feature.slug}
                                href={`/features/${feature.slug}`}
                                className="group p-8 rounded-2xl bg-card border border-border hover:border-accent/50 hover:bg-zinc-900/80 transition-all duration-300"
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <feature.icon className="w-8 h-8 text-accent group-hover:scale-110 transition-transform" />
                                    <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-accent group-hover:translate-x-1 transition-all" />
                                </div>
                                <h3 className="text-2xl font-bold mb-4">{feature.title}</h3>
                                <p className="text-muted-foreground">
                                    {feature.description}
                                </p>
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </main>
    )
}
