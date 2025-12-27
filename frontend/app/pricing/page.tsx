import { Metadata } from "next"
import { Check } from "lucide-react"
import { Button } from "@/components/ui/button"

export const metadata: Metadata = {
    title: "Pricing - Gemini Watermark Remover",
    description: "Simple, transparent pricing. Start for free.",
}

const tiers = [
    {
        name: "Free",
        price: "$0",
        description: "Perfect for testing and casual use.",
        features: [
            "3 Images per day",
            "Standard processing speed",
            "Max 10MB per image",
            "Standard Support"
        ],
        cta: "Start Free",
        variant: "outline" as const
    },
    {
        name: "Pro",
        price: "$4.99",
        period: "/month",
        description: "For creators and power users.",
        features: [
            "Unlimited images",
            "Priority fast processing",
            "Max 25MB per image",
            "Batch uploads",
            "API Access"
        ],
        cta: "Join Waitlist",
        variant: "accent" as const,
        popular: true
    },
    {
        name: "Enterprise",
        price: "Custom",
        description: "For API integration and high volume.",
        features: [
            "Custom API rate limits",
            "SLA Guarantee",
            "Dedicated Support",
            "On-premise option"
        ],
        cta: "Contact Sales",
        variant: "secondary" as const
    }
]

export default function PricingPage() {
    return (
        <main className="min-h-screen pt-24 pb-12">
            <div className="container mx-auto px-4">
                <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
                    <h1 className="text-4xl font-bold">Simple Pricing</h1>
                    <p className="text-xl text-muted-foreground">
                        Start for free, upgrade when you need more power.
                    </p>
                </div>

                <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                    {tiers.map((tier) => (
                        <div
                            key={tier.name}
                            className={`relative rounded-3xl p-8 border ${tier.popular ? "border-accent bg-accent/5" : "border-border bg-card"}`}
                        >
                            {tier.popular && (
                                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-accent text-black font-bold px-4 py-1 rounded-full text-sm">
                                    Most Popular
                                </div>
                            )}

                            <div className="mb-8">
                                <h3 className="text-xl font-bold mb-2">{tier.name}</h3>
                                <div className="flex items-baseline gap-1">
                                    <span className="text-4xl font-bold">{tier.price}</span>
                                    {tier.period && <span className="text-muted-foreground">{tier.period}</span>}
                                </div>
                                <p className="text-muted-foreground mt-2 text-sm">{tier.description}</p>
                            </div>

                            <ul className="space-y-4 mb-8">
                                {tier.features.map((feature) => (
                                    <li key={feature} className="flex items-center gap-3 text-sm">
                                        <Check className="w-4 h-4 text-accent" />
                                        {feature}
                                    </li>
                                ))}
                            </ul>

                            <Button className="w-full" variant={tier.variant}>
                                {tier.cta}
                            </Button>
                        </div>
                    ))}
                </div>
            </div>
        </main>
    )
}
