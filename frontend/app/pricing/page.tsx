import { Metadata } from "next"
import { PricingClient } from "@/components/pricing/pricing-client"

export const metadata: Metadata = {
    title: "Pricing - Gemini Watermark Remover",
    description: "Choose the perfect plan for your needs. Remove watermarks from Gemini images with our flexible pricing options.",
}

export default function PricingPage() {
    return <PricingClient />
}
