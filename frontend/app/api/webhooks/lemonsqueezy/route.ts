import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import crypto from 'crypto'

/**
 * Lemon Squeezy Webhook Handler
 * Handles subscription events and updates user profiles
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.text()
        const signature = request.headers.get('x-signature')

        // Verify webhook signature
        const secret = process.env.LEMONSQUEEZY_WEBHOOK_SECRET
        if (!secret) {
            console.error('Missing LEMONSQUEEZY_WEBHOOK_SECRET')
            return NextResponse.json({ error: 'Server configuration error' }, { status: 500 })
        }

        const hmac = crypto.createHmac('sha256', secret)
        const digest = hmac.update(body).digest('hex')

        if (signature !== digest) {
            console.error('Invalid webhook signature')
            return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
        }

        const event = JSON.parse(body)
        const eventName = event.meta?.event_name

        console.log('Webhook received:', eventName)

        // Handle subscription events
        if (eventName === 'subscription_created' || eventName === 'subscription_updated') {
            const userId = event.meta?.custom_data?.user_id
            const status = event.data?.attributes?.status

            if (!userId) {
                console.error('No user_id in webhook data')
                return NextResponse.json({ error: 'Missing user_id' }, { status: 400 })
            }

            // Update user profile in Supabase
            const supabase = await createClient()
            const isPro = status === 'active' || status === 'on_trial'

            const { error } = await supabase
                .from('profiles')
                .update({
                    is_pro: isPro,
                    subscription_id: event.data?.id || null,
                    customer_id: event.data?.attributes?.customer_id || null,
                    updated_at: new Date().toISOString()
                })
                .eq('id', userId)

            if (error) {
                console.error('Supabase update error:', error)
                return NextResponse.json({ error: 'Database update failed' }, { status: 500 })
            }

            console.log(`User ${userId} updated: is_pro=${isPro}`)
        }

        if (eventName === 'subscription_cancelled' || eventName === 'subscription_expired') {
            const userId = event.meta?.custom_data?.user_id

            if (userId) {
                const supabase = await createClient()
                const { error } = await supabase
                    .from('profiles')
                    .update({
                        is_pro: false,
                        updated_at: new Date().toISOString()
                    })
                    .eq('id', userId)

                if (error) {
                    console.error('Supabase update error:', error)
                }

                console.log(`User ${userId} subscription cancelled`)
            }
        }

        return NextResponse.json({ received: true })
    } catch (error) {
        console.error('Webhook error:', error)
        return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 })
    }
}
