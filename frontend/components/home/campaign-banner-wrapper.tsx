import { createClient } from "@/lib/supabase/server"
import { CampaignManager } from "@/components/home/campaign-manager"

export async function CampaignBannerWrapper() {
    try {
        const supabase = await createClient()

        // Fetch count (this is the slow part)
        const { count } = await supabase
            .from('profiles')
            .select('*', { count: 'exact', head: true })

        const limit = parseInt(process.env.EARLY_ADOPTER_LIMIT || '50', 10)
        const remaining = Math.max(0, limit - (count || 0))

        return <CampaignManager earlyAdopterRemaining={remaining} />
    } catch (error) {
        console.error("Failed to fetch campaign stats:", error)
        // Fallback: assume some slots open or closed? Better to hide or show default.
        // If we show 0, it hides. If we show >0, it shows.
        // Let's safe fail to hiding it to avoid broken UI.
        return <CampaignManager earlyAdopterRemaining={0} />
    }
}
