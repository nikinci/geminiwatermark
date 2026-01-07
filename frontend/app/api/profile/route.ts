import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
    try {
        const supabase = await createClient()

        // Get authenticated user
        const { data: { user }, error: authError } = await supabase.auth.getUser()

        if (authError || !user) {
            return NextResponse.json({ is_pro: false })
        }

        // Fetch profile from database
        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('is_pro, pro_expires_at, referral_code')
            .eq('id', user.id)
            .single()

        if (profileError) {
            console.error('Profile fetch error:', profileError)
            return NextResponse.json({ is_pro: false })
        }

        // Calculate effective status
        const isPro = profile.is_pro || (profile.pro_expires_at && new Date(profile.pro_expires_at) > new Date())

        return NextResponse.json({
            is_pro: isPro,
            user_id: user.id,
            email: user.email,
            referral_code: profile.referral_code
        })
    } catch (error) {
        console.error('API route error:', error)
        return NextResponse.json({ is_pro: false }, { status: 500 })
    }
}
