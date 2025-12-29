import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { FEATURES } from '@/lib/features-data'
import { Check } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

interface FeaturePageProps {
    params: Promise<{
        slug: string
    }>
}

export async function generateStaticParams() {
    return FEATURES.map((feature) => ({
        slug: feature.slug,
    }))
}

export async function generateMetadata({ params }: FeaturePageProps): Promise<Metadata> {
    const { slug } = await params
    const feature = FEATURES.find((f) => f.slug === slug)

    if (!feature) {
        return {
            title: 'Feature Not Found',
        }
    }

    return {
        title: `${feature.title} - Gemini Watermark Remover Features`,
        description: feature.description,
        openGraph: {
            title: `${feature.title} - Advanced AI Feature`,
            description: feature.description,
            type: 'article',
        },
    }
}

export default async function FeaturePage({ params }: FeaturePageProps) {
    const { slug } = await params
    const feature = FEATURES.find((f) => f.slug === slug)

    if (!feature) {
        notFound()
    }

    const Icon = feature.icon

    return (
        <main className="min-h-screen pt-24 pb-12">
            <div className="container mx-auto px-4">
                <div className="max-w-4xl mx-auto">
                    {/* Header */}
                    <div className="text-center mb-16 space-y-6">
                        <div className="inline-flex items-center justify-center p-4 rounded-2xl bg-accent/10 mb-4">
                            <Icon className="w-12 h-12 text-accent" />
                        </div>
                        <h1 className="text-4xl md:text-5xl font-bold">{feature.title}</h1>
                        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                            {feature.description}
                        </p>
                    </div>

                    {/* Content */}
                    <div className="grid md:grid-cols-3 gap-12 items-start">
                        {/* Main Description */}
                        <div className="md:col-span-2 space-y-8">
                            <div className="prose prose-invert max-w-none">
                                <h2 className="text-2xl font-semibold mb-4">How it works</h2>
                                <p className="text-lg leading-relaxed text-gray-300">
                                    {feature.longDescription}
                                </p>
                            </div>

                            <div className="bg-card border border-border rounded-xl p-8">
                                <h3 className="text-xl font-semibold mb-6">Key Benefits</h3>
                                <ul className="space-y-4">
                                    {feature.benefits.map((benefit, i) => (
                                        <li key={i} className="flex items-center gap-3">
                                            <div className="flex-shrink-0 w-6 h-6 rounded-full bg-green-500/10 flex items-center justify-center">
                                                <Check className="w-4 h-4 text-green-500" />
                                            </div>
                                            <span>{benefit}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>

                        {/* Sidebar / CTA */}
                        <div className="md:col-span-1 sticky top-24">
                            <div className="bg-card/50 backdrop-blur-sm border border-border rounded-xl p-6 space-y-6">
                                <h3 className="text-lg font-semibold">Ready to get started?</h3>
                                <p className="text-sm text-muted-foreground">
                                    Try out our {feature.title.toLowerCase()} feature right now. No account needed.
                                </p>
                                <Button size="lg" className="w-full" asChild>
                                    <Link href="/">Try for Free</Link>
                                </Button>
                                <div className="text-xs text-center text-muted-foreground">
                                    Limited time free access
                                </div>
                            </div>

                            <div className="mt-6">
                                <Link
                                    href="/features"
                                    className="flex items-center justify-center text-sm text-muted-foreground hover:text-white transition-colors"
                                >
                                    ← Back to All Features
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    )
}
