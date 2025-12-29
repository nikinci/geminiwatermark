import { createBrowserClient } from '@supabase/ssr'

/**
 * Creates Supabase browser client
 * Official setup for @supabase/ssr v0.5.1
 */
export function createClient() {
    return createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
}
