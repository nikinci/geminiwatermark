import { Hero } from "@/components/home/hero"
import { BeforeAfter } from "@/components/home/before-after"
import { HowItWorks } from "@/components/home/how-it-works"
import { FeaturesGrid } from "@/components/home/features-grid"
import { StatsCounter } from "@/components/home/stats-counter"
import { FAQ } from "@/components/home/faq"
import { CTASection } from "@/components/home/cta-section"
import { JsonLd } from "@/components/shared/json-ld"

export default function Home() {
  return (
    <main className="min-h-screen bg-background text-foreground selection:bg-accent/20 selection:text-accent overflow-x-hidden">
      <JsonLd />
      <Hero />
      <StatsCounter />
      <BeforeAfter />
      <HowItWorks />
      <FeaturesGrid />
      <FAQ />
      <CTASection />
    </main>
  )
}
