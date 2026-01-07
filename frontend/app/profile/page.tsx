'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Profile } from '@/types/supabase'
import { toast } from 'sonner'
import { Copy, Loader2, Gift, Crown, Calendar } from 'lucide-react'

export default function ProfilePage() {
    const [profile, setProfile] = useState<Profile | null>(null)
    const [loading, setLoading] = useState(true)
    const router = useRouter()
    const supabase = createClient()

    useEffect(() => {
        async function loadProfile() {
            const { data: { user } } = await supabase.auth.getUser()

            if (!user) {
                router.push('/login')
                return
            }

            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .single()

            if (error) {
                toast.error('Failed to load profile')
            } else {
                setProfile(data)
            }
            setLoading(false)
        }

        loadProfile()
    }, [router, supabase])

    const copyReferralLink = () => {
        if (!profile?.referral_code) return

        // Use window.location.origin to get the base URL
        const origin = window.location.origin
        const link = `${origin}/?ref=${profile.referral_code}`

        navigator.clipboard.writeText(link)
        toast.success('Referral link copied to clipboard!')
    }

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center bg-black text-white">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        )
    }

    const isPro = profile?.is_pro || (profile?.pro_expires_at && new Date(profile.pro_expires_at) > new Date())
    const proExpiresDate = profile?.pro_expires_at ? new Date(profile.pro_expires_at).toLocaleDateString() : null

    return (
        <div className="min-h-screen bg-black text-white p-8 pt-24">
            <div className="max-w-2xl mx-auto space-y-8">

                {/* Header */}
                <div className="space-y-2">
                    <h1 className="text-3xl font-bold">My Profile</h1>
                    <p className="text-gray-400">Manage your subscription and rewards.</p>
                </div>

                {/* Pro Status Card */}
                <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl p-6 border border-white/10 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <Crown className="w-32 h-32" />
                    </div>

                    <div className="relative z-10 space-y-4">
                        <div className="flex items-center space-x-3">
                            <div className={`p-2 rounded-lg ${isPro ? 'bg-amber-500/20 text-amber-500' : 'bg-gray-700/50 text-gray-400'}`}>
                                <Crown className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-lg">{isPro ? 'Pro Member' : 'Free Plan'}</h3>
                                {isPro && proExpiresDate && (
                                    <p className="text-sm text-amber-500/80 flex items-center mt-1">
                                        <Calendar className="w-3 h-3 mr-1" />
                                        Expires on {proExpiresDate}
                                    </p>
                                )}
                            </div>
                        </div>

                        {!isPro && (
                            <Button className="bg-white text-black hover:bg-gray-200" onClick={() => router.push('/pricing')}>
                                Upgrade to Pro
                            </Button>
                        )}
                    </div>
                </div>

                {/* Referral Section */}
                <div className="bg-white/5 rounded-xl p-6 border border-white/10 space-y-6">
                    <div className="space-y-2">
                        <h3 className="text-xl font-semibold flex items-center">
                            <Gift className="w-5 h-5 mr-2 text-pink-500" />
                            Invite Friends & Earn Pro
                        </h3>
                        <p className="text-sm text-gray-400">
                            Share your unique link. For every friend who signs up, you get <span className="text-white font-medium">1 week of Pro</span> for free!
                        </p>
                    </div>

                    <div className="flex items-center space-x-3 bg-black/50 p-3 rounded-lg border border-white/5">
                        <code className="flex-1 text-sm text-gray-300 font-mono truncate">
                            {typeof window !== 'undefined' ? window.location.origin : ''}/?ref={profile?.referral_code || '...'}
                        </code>
                        <Button size="sm" variant="ghost" className="hover:bg-white/10" onClick={copyReferralLink}>
                            <Copy className="w-4 h-4" />
                        </Button>
                    </div>
                </div>

            </div>
        </div>
    )
}
