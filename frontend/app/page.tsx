import { Hero } from "@/components/home/hero"
import { BeforeAfter } from "@/components/home/before-after"
import { HowItWorks } from "@/components/home/how-it-works"
import { FeaturesGrid } from "@/components/home/features-grid"
import { StatsCounter } from "@/components/home/stats-counter"
import { FAQ } from "@/components/home/faq"
import { CTASection } from "@/components/home/cta-section"
import { JsonLd } from "@/components/shared/json-ld"
import { CampaignManager } from "@/components/home/campaign-manager"
import { Suspense } from "react"
import { CampaignBannerWrapper } from "@/components/home/campaign-banner-wrapper"

export const revalidate = 0 // Ensure fresh data for the counter

export default function Home() {
  return (
    <main className="min-h-screen bg-background text-foreground selection:bg-accent/20 selection:text-accent overflow-x-hidden pt-[64px]">
      <JsonLd />

      {/* Streaming the campaign banner so it doesn't block the page load */}
      <Suspense fallback={<div className="h-10 w-full bg-transparent" />}>
        <CampaignBannerWrapper />
      </Suspense>

      <Hero />
      <StatsCounter />
      <BeforeAfter
        originalUrl="/demo/original.png"
        processedUrl="/demo/processed.png"
        buttonText="Try for Free"
        scrollToTopOnAction={true}
      />
      <HowItWorks />
      <FeaturesGrid />
      <FAQ />
      <CTASection />
    </main>
  )
}
