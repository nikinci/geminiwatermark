import { createClient } from '@supabase/supabase-js'
import { checkAndRewardUser } from '../lib/rewards'
import dotenv from 'dotenv'
import path from 'path'

// Load .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!
const RESEND_API_KEY = process.env.RESEND_API_KEY!

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY || !RESEND_API_KEY) {
    console.error('Missing environment variables. Ensure NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, and RESEND_API_KEY are set.')
    process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

async function main() {
    const limit = parseInt(process.env.EARLY_ADOPTER_LIMIT || '50', 10)
    console.log(`Fetching first ${limit} users...`)

    // We fetch a larger batch from AUTH to ensure we have the full dataset to sort.
    // listUsers order is not guaranteed to be ASC, so we fetch more and sort manually.
    const { data: { users: allUsers }, error } = await supabase.auth.admin.listUsers({
        perPage: 1000 // Fetch widely to cover the "First 50" even if they are at the end of the list
    })

    if (error) {
        console.error('Error fetching users:', error)
        return
    }

    // Sort by created_at ASC (Oldest first)
    // The user wants the "First 50 users who ever signed up".
    allUsers.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())

    // Take the limit
    const users = allUsers.slice(0, limit)

    console.log(`Found ${users.length} users. processing...`)

    for (const user of users) {
        if (!user.email) continue

        console.log(`Checking user: ${user.email}`)

        // Pass dynamic limit from env
        await checkAndRewardUser(supabase, user.id, user.email, RESEND_API_KEY, limit)
    }
}

main().catch(console.error)
