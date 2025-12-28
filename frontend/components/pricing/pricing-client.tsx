"use client"

import { Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"

export function PricingClient() {
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    // Real Lemon Squeezy Product URL
    const LEMON_SQUEEZY_URL = "https://cmoontech.lemonsqueezy.com/checkout/buy/49825ef9-979a-4756-a744-b26b8ea1e57f";

    useEffect(() => {
        const supabase = createClient();

        async function fetchProfile(sessionUser: any) {
            try {
                if (sessionUser) {
                    const { data: profile } = await supabase
                        .from('profiles')
                        .select('is_pro')
                        .eq('id', sessionUser.id)
                        .single()
                    setUser({ ...sessionUser, is_pro: profile?.is_pro ?? false })
                } else {
                    setUser(null)
                }
            } catch (error) {
                console.error("Profile fetch error:", error);
                setUser(null);
            } finally {
                setLoading(false);
            }
        }

        // Listen for auth changes (login, logout, initial session load)
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            fetchProfile(session?.user ?? null);
        });

        return () => {
            subscription.unsubscribe();
        };
    }, []);

    return (
        <div className="min-h-screen pt-24 pb-12">
            <div className="container px-4 mx-auto">
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <h1 className="text-4xl font-bold mb-4">Simple Pricing</h1>
                    <p className="text-gray-400 text-lg">
                        Start for free, upgrade when you need more power.
                    </p>
                </div>

                <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                    {/* Free Plan */}
                    <div className="p-8 rounded-2xl bg-white/5 border border-white/10 flex flex-col">
                        <div className="mb-4">
                            <h3 className="text-xl font-bold">Free</h3>
                            <div className="mt-2 text-3xl font-bold">$0</div>
                            <p className="text-sm text-gray-400 mt-1">Perfect for testing and casual use.</p>
                        </div>
                        <ul className="space-y-3 mb-8 flex-1">
                            <li className="flex items-center gap-2 text-sm text-gray-300">
                                <Check className="w-4 h-4 text-accent" />
                                3 Images per day
                            </li>
                            <li className="flex items-center gap-2 text-sm text-gray-300">
                                <Check className="w-4 h-4 text-accent" />
                                Standard processing speed
                            </li>
                            <li className="flex items-center gap-2 text-sm text-gray-300">
                                <Check className="w-4 h-4 text-accent" />
                                Max 10MB per image
                            </li>
                            <li className="flex items-center gap-2 text-sm text-gray-300">
                                <Check className="w-4 h-4 text-accent" />
                                Standard Support
                            </li>
                        </ul>
                        {!loading && user ? (
                            !user.is_pro ? (
                                <Button className="w-full" variant="outline" disabled>
                                    Current Plan
                                </Button>
                            ) : (
                                <Button className="w-full" variant="ghost" disabled>
                                    Included
                                </Button>
                            )
                        ) : (
                            <Button className="w-full" variant="outline" asChild>
                                <Link href="/">Start Free</Link>
                            </Button>
                        )}
                    </div>

                    {/* Pro Plan */}
                    <div className="p-8 rounded-2xl bg-white/5 border border-accent/50 relative flex flex-col">
                        <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-accent text-white px-3 py-1 rounded-full text-xs font-bold">
                            Most Popular
                        </div>
                        <div className="mb-4">
                            <h3 className="text-xl font-bold">Pro</h3>
                            <div className="mt-2 text-3xl font-bold">$4.99<span className="text-sm text-gray-400 font-medium">/month</span></div>
                            <p className="text-sm text-gray-400 mt-1">For creators and power users.</p>
                        </div>
                        <ul className="space-y-3 mb-8 flex-1">
                            <li className="flex items-center gap-2 text-sm text-gray-300">
                                <Check className="w-4 h-4 text-accent" />
                                Unlimited images
                            </li>
                            <li className="flex items-center gap-2 text-sm text-gray-300">
                                <Check className="w-4 h-4 text-accent" />
                                Priority fast processing
                            </li>
                            <li className="flex items-center gap-2 text-sm text-gray-300">
                                <Check className="w-4 h-4 text-accent" />
                                Max 25MB per image
                            </li>
                            <li className="flex items-center gap-2 text-sm text-gray-300">
                                <Check className="w-4 h-4 text-accent" />
                                Batch uploads
                            </li>

                        </ul>

                        {!loading && (
                            user ? (
                                user.is_pro ? (
                                    <Button className="w-full" variant="outline" asChild>
                                        <a href="https://app.lemonsqueezy.com/my-orders" target="_blank" rel="noopener noreferrer">
                                            Manage Subscription
                                        </a>
                                    </Button>
                                ) : (
                                    <Button className="w-full" variant="accent" asChild>
                                        <a
                                            href={`${LEMON_SQUEEZY_URL}?checkout[custom][user_id]=${user.id}&checkout[email]=${user.email}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            Subscribe Now
                                        </a>
                                    </Button>
                                )
                            ) : (
                                <Button className="w-full" variant="accent" asChild>
                                    <Link href="/login">Login to Subscribe</Link>
                                </Button>
                            )
                        )}

                    </div>

                    {/* Enterprise Plan */}
                    <div className="p-8 rounded-2xl bg-white/5 border border-white/10 flex flex-col">
                        <div className="mb-4">
                            <h3 className="text-xl font-bold">Enterprise</h3>
                            <div className="mt-2 text-3xl font-bold">Custom</div>
                            <p className="text-sm text-gray-400 mt-1">For API integration and high volume.</p>
                        </div>
                        <ul className="space-y-3 mb-8 flex-1">
                            <li className="flex items-center gap-2 text-sm text-gray-300">
                                <Check className="w-4 h-4 text-accent" />
                                Custom API rate limits
                            </li>
                            <li className="flex items-center gap-2 text-sm text-gray-300">
                                <Check className="w-4 h-4 text-accent" />
                                SLA Guarantee
                            </li>
                            <li className="flex items-center gap-2 text-sm text-gray-300">
                                <Check className="w-4 h-4 text-accent" />
                                Dedicated Support
                            </li>
                            <li className="flex items-center gap-2 text-sm text-gray-300">
                                <Check className="w-4 h-4 text-accent" />
                                On-premise option
                            </li>
                        </ul>
                        <Button className="w-full" variant="outline" asChild>
                            <Link href="/contact">Contact Sales</Link>
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}
