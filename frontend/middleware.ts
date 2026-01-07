import { type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

export async function middleware(request: NextRequest) {
    const response = await updateSession(request)

    // Capture referral code from URL
    const referralCode = request.nextUrl.searchParams.get('ref')
    if (referralCode) {
        response.cookies.set('referral_code', referralCode, {
            path: '/',
            httpOnly: false, // Allow client-side access
            maxAge: 60 * 60 * 24 * 30, // 30 days
            sameSite: 'lax'
        })
    }

    return response
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * Feel free to modify this pattern to include more paths.
         */
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
}
