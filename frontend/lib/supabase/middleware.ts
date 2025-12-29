import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
    let response = NextResponse.next({
        request: {
            headers: request.headers,
        },
    })

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll()
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value, options }) =>
                        request.cookies.set({
                            name,
                            value,
                            ...options,
                        })
                    )
                    response = NextResponse.next({
                        request,
                    })
                    cookiesToSet.forEach(({ name, value, options }) =>
                        response.cookies.set(name, value, options)
                    )
                },
            },
        }
    )

    try {
        // Refresh session if expired - this is crucial for SSR
        const { data: { user }, error } = await supabase.auth.getUser()

        if (error) {
            console.error('⚠️ Middleware: Failed to get user:', error.message)
        }

        // User will be null if not authenticated, which is fine
        // The response already has refreshed cookies if needed
    } catch (error) {
        console.error('❌ Middleware: Unexpected error:', error)
    }

    return response
}
