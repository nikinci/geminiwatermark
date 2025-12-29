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
            .select('is_pro')
            .eq('id', user.id)
            .single()

        if (profileError) {
            console.error('Profile fetch error:', profileError)
            return NextResponse.json({ is_pro: false })
        }

        return NextResponse.json({
            is_pro: profile?.is_pro ?? false,
            user_id: user.id,
            email: user.email
        })
    } catch (error) {
        console.error('API route error:', error)
        return NextResponse.json({ is_pro: false }, { status: 500 })
    }
}
