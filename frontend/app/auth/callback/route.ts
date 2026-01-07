import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { checkAndRewardUser } from '@/lib/rewards'

export async function GET(request: Request) {
    console.log('🔐 AUTH CALLBACK: Route hit!')
    const { searchParams, origin } = new URL(request.url)
    const code = searchParams.get('code')
    // if "next" is in param, use it as the redirect URL
    const next = searchParams.get('next') ?? '/'

    console.log('🔐 AUTH CALLBACK: code=', code ? 'present' : 'MISSING', 'next=', next, 'origin=', origin)

    if (code) {
        const supabase = await createClient()
        console.log('🔐 AUTH CALLBACK: Exchanging code for session...')

        const { data, error } = await supabase.auth.exchangeCodeForSession(code)

        if (!error && data.user && data.user.email) {
            console.log('🔐 AUTH CALLBACK: Session exchange SUCCESS')

            // Fire and forget reward check
            checkAndRewardUser(supabase, data.user.id, data.user.email)
                .catch((err: any) => console.error('Reward check failed:', err))

            // MANUAL REFERRAL CLAIM (V5)
            // If the trigger missed it (metadata fail), we catch it here via RPC.
            const cookieStore = request.headers.get('cookie') || ''
            const match = cookieStore.match(new RegExp('(^| )referral_code=([^;]+)'))
            const referralCode = match ? match[2] : null

            if (referralCode) {
                console.log('🚀 Attempting to claim referral via RPC:', referralCode)

                // IMPORTANT: Await this so it finishes before redirect!
                // Calling V2 with email to ensure profile is complete
                const { data: rpcData, error: rpcError } = await supabase.rpc('claim_referral_v2', {
                    code: referralCode,
                    user_email: data.user.email
                })

                if (rpcError) {
                    console.error('❌ Referral RPC Error:', rpcError)
                } else {
                    console.log('✅ Referral RPC Result:', rpcData)
                }
            }

            // CLEAN UP: Always redirect to origin + next to avoid host mismatches
            const redirectTo = new URL(next, origin)
            return NextResponse.redirect(redirectTo)
        } else {
            console.error('🔐 AUTH CALLBACK: Exchange FAILED:', error?.message)
            return NextResponse.redirect(`${origin}/auth/auth-code-error`)
        }
    }

    // No code present
    console.error('🔐 AUTH CALLBACK: No "code" parameter found')
    return NextResponse.redirect(`${origin}/auth/auth-code-error`)
}
