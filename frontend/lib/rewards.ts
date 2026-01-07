import { SupabaseClient, createClient } from '@supabase/supabase-js'

export async function checkAndRewardUser(
    // We keep the first argument to maintain signature, but we won't use it for sensitive ops
    // or we can just ignore it. Best to use a fresh admin client.
    _publicClient: SupabaseClient | null,
    userId: string,
    userEmail: string,
    resendApiKey?: string,
    customLimit?: number
) {
    if (!userEmail) return

    // Initialize Admin Client
    const adminClient = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // 1. Check current user status
    // We check if they are ALREADY pro OR if they EVER had a pro expiration date set (even if expired).
    // This prevents re-rewarding users who had a reward that expired.
    const { data: profile, error: profileError } = await adminClient
        .from('profiles')
        .select('is_pro, referral_code, pro_expires_at, is_early_adopter')
        .eq('id', userId)
        .single()

    // Check if they already claimed the specific Early Adopter reward
    if (profile?.is_early_adopter) {
        console.log(`User ${userEmail} already received Early Adopter reward. Skipping.`)
        return
    }

    // Note: We intentionally allow them to have pro_expires_at (from referrals) and still get this reward.
    // They stack! (1 Week + 1 Month)

    if (profileError && profileError.code !== 'PGRST116') {
        console.error('Error fetching profile:', profileError)
        // If it's a real error (not just missing row), we might want to stop or proceed?
        // Safe bet: stop to avoid weirdness, but missing row (PGRST116) means we SHOULD proceed.
        return
    }

    // 2. Check total user count
    const { count, error: countError } = await adminClient
        .from('profiles')
        .select('*', { count: 'exact', head: true })

    const limit = customLimit !== undefined
        ? customLimit
        : parseInt(process.env.EARLY_ADOPTER_LIMIT || '50', 10)

    if (countError || (count !== null && count > limit)) {
        console.log(`User count ${count} exceeds limit ${limit}. checking partial profile creation...`)

        // CRITICAL FIX: If profile is missing but limit exceeded, we MUST create a basic profile
        // otherwise the user exists in Auth but has no Profile (and no ref code to invite others).
        if (profileError && profileError.code === 'PGRST116') {
            console.log('⚠️ Limit exceeded AND Profile missing. Creating basic profile...')

            // 1. Generate Code using database function
            const { data: newRefCode, error: refError } = await adminClient.rpc('generate_unique_referral_code')

            if (refError || !newRefCode) {
                console.error('Failed to generate ref code for basic profile:', refError)
                return
            }

            // 2. Insert Basic Profile
            const { error: insertError } = await adminClient
                .from('profiles')
                .insert({
                    id: userId,
                    email: userEmail,
                    referral_code: newRefCode,
                    // No pro rewards
                })

            if (insertError) {
                console.error('Failed to create basic profile:', insertError)
            } else {
                console.log('✅ Basic profile created successfully (No Early Adopter Reward).')
            }
        } else {
            console.log(`User ${userEmail} already has a profile (or other error). Skipping.`)
        }

        return
    }

    console.log(`User ${userEmail} is within the first ${limit} users (Count: ${count}). Granting reward...`)

    // 3. Grant Pro (Securely using Admin Client)
    const { error: rpcError } = await adminClient.rpc('grant_early_adopter_pro', {
        user_email: userEmail,
        user_uuid: userId
    })

    if (rpcError) {
        console.error(`Failed to grant pro to ${userEmail}:`, rpcError)
        return
    }

    // 4. Send Email
    const apiKey = resendApiKey || process.env.RESEND_API_KEY
    if (!apiKey) {
        console.error('Missing RESEND_API_KEY. Cannot send email.')
        return
    }

    try {
        const res = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                from: 'GeminiWatermark AI <gemini@cmoontech.com>',
                to: [userEmail],
                subject: 'Your 1-Month Pro Membership is Here! 🎁',
                html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to Pro</title>
</head>
<body
  style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #09090b; margin: 0; padding: 40px 20px; color: #e4e4e7;">
  <div
    style="max-width: 500px; margin: 0 auto; background-color: #18181b; border-radius: 16px; border: 1px solid #27272a; padding: 40px; text-align: center;">
    <!-- Logo Section -->
    <div style="margin-bottom: 32px;">
      <img src="https://geminiwatermark.ai/icon" alt="GeminiWatermark.ai Logo" width="64" height="64"
        style="border-radius: 12px;">
      <div style="font-size: 24px; font-weight: 700; color: white; margin-top: 16px; letter-spacing: -0.5px;">
        GeminiWatermark<span style="color: #22c55e;">.ai</span>
      </div>
    </div>
    
    <!-- Main Content -->
    <h1 style="color: white; font-size: 20px; font-weight: 600; margin: 0 0 16px;">Welcome to the Club! 🎁</h1>
    <p style="color: #a1a1aa; font-size: 15px; line-height: 1.6; margin: 0 0 24px;">
      Thank you for being one of our first users. As a token of our appreciation, we've added <strong>1 Month of Pro Membership</strong> to your account!
    </p>
    <p style="color: #a1a1aa; font-size: 15px; line-height: 1.6; margin: 0 0 32px;">
      You now have access to bulk processing, unlimited watermarks, and high-quality exports.
    </p>

    <!-- Highlight Box -->
    <div style="background-color: #27272a; border-radius: 8px; padding: 20px; margin-bottom: 32px; text-align: left;">
        <h2 style="color: white; font-size: 16px; font-weight: 600; margin: 0 0 8px;">Invite & Earn More</h2>
        <p style="color: #d4d4d8; font-size: 14px; line-height: 1.5; margin: 0 0 16px;">
            Get <strong>+1 Week Pro</strong> for every friend you refer.
        </p>
        <div style="background-color: #09090b; border: 1px solid #3f3f46; border-radius: 6px; padding: 12px; font-family: monospace; color: #22c55e; font-size: 13px; word-break: break-all;">
            https://geminiwatermark.ai/?ref=${profile?.referral_code || 'CODE'}
        </div>
    </div>

    <!-- Button -->
    <a href="https://geminiwatermark.ai"
      style="display: inline-block; background-color: #22c55e; color: black; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 15px; transition: background-color 0.2s;">
      Start Creating
    </a>
    
    <!-- Footer -->
    <div style="margin-top: 40px; padding-top: 24px; border-top: 1px solid #27272a;">
      <p style="color: #71717a; font-size: 13px; margin: 0;">
        Questions? Just reply to this email.
      </p>
    </div>
  </div>
</body>
</html>
                `
            })
        })

        if (!res.ok) {
            const text = await res.text()
            console.error(`Failed to send email to ${userEmail}:`, text)
        } else {
            console.log(`📧 Sent email to ${userEmail}`)
        }

    } catch (emailError) {
        console.error(`Error sending email to ${userEmail}:`, emailError)
    }
}
