import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

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

        const { error } = await supabase.auth.exchangeCodeForSession(code)

        if (!error) {
            console.log('🔐 AUTH CALLBACK: Session exchange SUCCESS')

            // CLEAN UP: Always redirect to origin + next to avoid host mismatches
            const redirectTo = new URL(next, origin)
            return NextResponse.redirect(redirectTo)
        } else {
            console.error('🔐 AUTH CALLBACK: Exchange FAILED:', error.message)
            return NextResponse.redirect(`${origin}/auth/auth-code-error`)
        }
    }

    // No code present
    console.error('🔐 AUTH CALLBACK: No "code" parameter found')
    return NextResponse.redirect(`${origin}/auth/auth-code-error`)
}
