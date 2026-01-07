import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import path from 'path'

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function main() {
    const email = 'nurullahikinci@gmail.com'
    console.log(`Resetting reward status for ${email}...`)

    // Get User ID
    const { data: { users }, error: userError } = await supabase.auth.admin.listUsers()
    const user = users?.find(u => u.email === email)

    if (!user) {
        console.error('User not found')
        return
    }

    const { error } = await supabase
        .from('profiles')
        .update({ is_early_adopter: false })
        .eq('id', user.id)

    if (error) console.error('Error:', error)
    else console.log('Success! Ready to re-reward.')
}

main()
