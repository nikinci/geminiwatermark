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

import { Breadcrumbs } from '@/components/shared/breadcrumbs'

export default async function FeaturePage({ params }: FeaturePageProps) {
    const { slug } = await params
    const feature = FEATURES.find((f) => f.slug === slug)

    if (!feature) {
        notFound()
    }

    const Icon = feature.icon

    // Get 3 random other features for internal linking
    const otherFeatures = FEATURES.filter(f => f.slug !== slug).slice(0, 3)

    return (
        <main className="min-h-screen pt-24 pb-12">
            <div className="container mx-auto px-4">
                <div className="max-w-5xl mx-auto">
                    {/* Breadcrumbs */}
                    <Breadcrumbs items={[
                        { label: 'Features', href: '/features' },
                        { label: feature.title, href: `/features/${slug}` }
                    ]} />

                    {/* Header */}
                    <div className="text-center mb-16 space-y-6">
                        <div className="inline-flex items-center justify-center p-4 rounded-2xl bg-accent/10 mb-4">
                            <Icon className="w-12 h-12 text-accent" />
                        </div>
                        <h1 className="text-4xl md:text-6xl font-bold">{feature.title}</h1>
                        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                            {feature.description}
                        </p>
                    </div>

                    {/* Content Grid */}
                    <div className="grid md:grid-cols-3 gap-12 items-start mb-24">
                        {/* Main Content Column */}
                        <div className="md:col-span-2 space-y-12">
                            {/* Deep Dive */}
                            <div className="prose prose-invert max-w-none">
                                <h2 className="text-2xl font-semibold mb-4 text-white">How it works</h2>
                                <p className="text-lg leading-relaxed text-zinc-300">
                                    {feature.longDescription}
                                </p>
                            </div>

                            {/* Benefits */}
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

                            {/* Use Cases - NEW SECTION */}
                            <div className="space-y-4">
                                <h2 className="text-2xl font-semibold text-white">Common Use Cases</h2>
                                <div className="grid gap-4">
                                    {feature.useCases.map((useCase, i) => (
                                        <div key={i} className="flex items-start gap-4 p-4 rounded-lg bg-zinc-900/50 border border-zinc-800">
                                            <div className="w-1.5 h-1.5 rounded-full bg-accent mt-2.5" />
                                            <p className="text-zinc-300">{useCase}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* FAQ - NEW SECTION */}
                            <div className="space-y-6">
                                <h2 className="text-2xl font-semibold text-white">Frequently Asked Questions</h2>
                                <div className="space-y-4">
                                    {feature.faq.map((item, i) => (
                                        <div key={i} className="space-y-2">
                                            <h3 className="font-medium text-white">{item.question}</h3>
                                            <p className="text-muted-foreground">{item.answer}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Sidebar / CTA */}
                        <div className="md:col-span-1 sticky top-24 space-y-8">
                            <div className="bg-card/50 backdrop-blur-sm border border-border rounded-xl p-6 space-y-6 shadow-2xl">
                                <h3 className="text-lg font-semibold">Start Resolving Now</h3>
                                <p className="text-sm text-muted-foreground">
                                    Experience the power of our {feature.title.toLowerCase()} engine instantly.
                                </p>
                                <Button size="lg" className="w-full" asChild>
                                    <Link href="/">Try for Free</Link>
                                </Button>
                                <div className="text-xs text-center text-muted-foreground">
                                    No credit card required
                                </div>
                            </div>

                            {/* Internal Linking - Related Features */}
                            <div className="space-y-4">
                                <h4 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Other Features</h4>
                                <div className="space-y-2">
                                    {otherFeatures.map(f => (
                                        <Link
                                            key={f.slug}
                                            href={`/features/${f.slug}`}
                                            className="block p-3 rounded-lg hover:bg-zinc-800 transition-colors border border-transparent hover:border-zinc-700"
                                        >
                                            <div className="flex items-center gap-3">
                                                <f.icon className="w-4 h-4 text-accent" />
                                                <span className="text-sm font-medium">{f.title}</span>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    )
}
