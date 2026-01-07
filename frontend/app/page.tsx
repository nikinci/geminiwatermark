import { Hero } from "@/components/home/hero"
import { BeforeAfter } from "@/components/home/before-after"
import { HowItWorks } from "@/components/home/how-it-works"
import { FeaturesGrid } from "@/components/home/features-grid"
import { StatsCounter } from "@/components/home/stats-counter"
import { FAQ } from "@/components/home/faq"
import { CTASection } from "@/components/home/cta-section"
import { JsonLd } from "@/components/shared/json-ld"
import { CampaignManager } from "@/components/home/campaign-manager"
import { createClient } from "@/lib/supabase/server"

export const revalidate = 0 // Ensure fresh data for the counter

export default async function Home() {
  // Server-side fetch for remaining spots
  const supabase = await createClient()
  const { count } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })

  const limit = parseInt(process.env.EARLY_ADOPTER_LIMIT || '50', 10)
  const remaining = Math.max(0, limit - (count || 0))

  return (
    <main className="min-h-screen bg-background text-foreground selection:bg-accent/20 selection:text-accent overflow-x-hidden pt-[64px]">
      <JsonLd />
      <CampaignManager earlyAdopterRemaining={remaining} />
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
