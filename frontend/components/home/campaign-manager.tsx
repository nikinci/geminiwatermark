"use client"

import { useAuth } from "@/hooks/use-auth"
import { motion, AnimatePresence } from "framer-motion"
import { Crown, Sparkles, Copy, Check } from "lucide-react"
import { useEffect, useState } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export function CampaignManager({
    earlyAdopterRemaining
}: {
    earlyAdopterRemaining: number
}) {
    const { user, loading } = useAuth()
    const [copied, setCopied] = useState(false)

    // Don't show anything while loading auth state
    if (loading) return null

    // 1. FOR LOGGED IN USERS: "Invite & Earn" Widget
    if (user) {
        const referralLink = typeof window !== 'undefined' && user.referral_code
            ? `${window.location.origin}/?ref=${user.referral_code}`
            : ''

        const handleCopy = () => {
            if (!referralLink) return
            navigator.clipboard.writeText(referralLink)
            setCopied(true)
            toast.success("Referral link copied!")
            setTimeout(() => setCopied(false), 2000)
        }

        return (
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-4xl mx-auto px-4 mt-8 mb-4 relative z-40"
            >
                <div className="bg-gradient-to-r from-purple-900/50 via-pink-900/50 to-purple-900/50 border border-purple-500/30 rounded-xl p-6 backdrop-blur-md relative overflow-hidden group">
                    {/* Glow effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                    <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
                        <div className="flex-1 text-center md:text-left">
                            <h3 className="text-xl font-bold text-white flex items-center justify-center md:justify-start gap-2 mb-2">
                                <Sparkles className="w-5 h-5 text-yellow-400 fill-yellow-400/20" />
                                Win Free Pro!
                            </h3>
                            <p className="text-purple-200/90 text-sm leading-relaxed">
                                Share your link. Friend gets
                                <span className="text-white font-bold ml-1 px-1 bg-white/10 rounded">1 Week Pro</span>.
                                You get
                                <span className="text-white font-bold ml-1 px-1 bg-white/10 rounded">1 Week Pro</span>.
                                🎁
                            </p>
                        </div>

                        <div className="flex items-center gap-2 bg-black/40 p-1.5 rounded-lg border border-white/10 w-full md:w-auto">
                            <code className="flex-1 md:flex-none text-xs text-purple-200 font-mono px-3 truncate max-w-[200px] md:max-w-none">
                                {referralLink}
                            </code>
                            <Button
                                size="sm"
                                variant={copied ? "default" : "secondary"}
                                onClick={handleCopy}
                                className={copied ? "bg-green-600 hover:bg-green-700 text-white" : ""}
                            >
                                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                <span className="sr-only">Copy</span>
                            </Button>
                        </div>
                    </div>
                </div>
            </motion.div>
        )
    }

    // 2. FOR GUESTS: "Early Adopter" Banner
    if (earlyAdopterRemaining > 0) {
        return (
            <motion.div
                initial={{ opacity: 0, y: -50 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full bg-gradient-to-r from-amber-600 to-orange-600 text-white py-3 px-4 relative z-50 shadow-lg shadow-orange-900/20"
            >
                <div className="container mx-auto flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-6 text-center sm:text-left">
                    <div className="flex items-center gap-2 font-bold text-lg md:text-xl text-white drop-shadow-sm">
                        <Crown className="w-5 h-5 md:w-6 md:h-6 fill-yellow-200 text-yellow-100" />
                        <span>Limited Offer:</span>
                    </div>

                    <p className="text-sm md:text-base font-medium text-orange-50">
                        Last <span className="font-bold text-white bg-white/20 px-1.5 py-0.5 rounded mx-1">{earlyAdopterRemaining} lucky users</span> get <span className="font-bold text-white underline decoration-white/50 underline-offset-4">1 Month Free Pro!</span>
                    </p>

                    <Button
                        size="sm"
                        variant="secondary"
                        className="bg-white text-orange-600 hover:bg-orange-50 font-bold border-0 shadow-sm whitespace-nowrap"
                        asChild
                    >
                        <Link href="/login">Claim Reward 🚀</Link>
                    </Button>
                </div>
            </motion.div>
        )
    }

    // Default: Show nothing
    return null
}
