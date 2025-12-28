"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { Menu, X, Zap, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

const navLinks = [
    { href: "/features", label: "Features" },
    { href: "/pricing", label: "Pricing" },
    { href: "/contact", label: "Contact" },
]

export function Header() {
    const [isOpen, setIsOpen] = useState(false)
    const [user, setUser] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const router = useRouter()

    useEffect(() => {
        const supabase = createClient()

        const getUser = async () => {
            try {
                const { data: { user }, error } = await supabase.auth.getUser()
                if (error) throw error;

                if (user) {
                    const { data: profile } = await supabase
                        .from('profiles')
                        .select('is_pro')
                        .eq('id', user.id)
                        .single()

                    setUser({ ...user, is_pro: profile?.is_pro ?? false })
                } else {
                    setUser(null)
                }
            } catch (error) {
                console.error("Auth error:", error)
                setUser(null)
            } finally {
                setLoading(false)
            }
        }
        getUser()

        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
            if (session?.user) {
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('is_pro')
                    .eq('id', session.user.id)
                    .single()
                setUser({ ...session.user, is_pro: profile?.is_pro ?? false })
            } else {
                setUser(null)
            }
            setLoading(false)
        })

        return () => subscription.unsubscribe()
    }, [])

    const handleSignOut = async () => {
        const supabase = createClient()
        await supabase.auth.signOut()
        setUser(null)
        router.refresh()
    }

    return (
        <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-background/80 backdrop-blur-md">
            <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                <Link href="/" className="flex items-center gap-2 font-bold text-xl tracking-tight">
                    <div className="w-8 h-8 rounded-lg bg-accent/20 flex items-center justify-center border border-accent/20">
                        <Zap className="w-5 h-5 text-accent fill-accent" />
                    </div>
                    <span>GeminiWatermark<span className="text-accent">.ai</span></span>
                </Link>

                {/* Desktop Nav */}
                <nav className="hidden md:flex items-center gap-8">
                    {navLinks.map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            className="text-sm font-medium text-muted-foreground hover:text-white transition-colors"
                        >
                            {link.label}
                        </Link>
                    ))}

                    {!loading && (
                        <>
                            {user ? (
                                <div className="flex items-center gap-4">
                                    <span className="text-sm text-muted-foreground hidden lg:block">{user.email}</span>
                                    <Button variant="ghost" size="sm" onClick={handleSignOut}>
                                        Logout
                                    </Button>
                                    {!user.is_pro && (
                                        <Button variant="accent" size="sm" asChild>
                                            <Link href="/pricing">Upgrade Pro</Link>
                                        </Button>
                                    )}
                                </div>
                            ) : (
                                <Button variant="outline" size="sm" asChild className="border-white/10 hover:bg-white/5">
                                    <Link href="/login">Login</Link>
                                </Button>
                            )}
                        </>
                    )}
                </nav>

                {/* Mobile Toggle */}
                <button
                    className="md:hidden p-2 text-muted-foreground hover:text-white"
                    onClick={() => setIsOpen(!isOpen)}
                >
                    {isOpen ? <X /> : <Menu />}
                </button>
            </div>

            {/* Mobile Nav */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="md:hidden border-b border-white/5 bg-background"
                    >
                        <div className="container px-4 py-4 flex flex-col gap-4">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className="text-sm font-medium text-muted-foreground hover:text-white py-2"
                                    onClick={() => setIsOpen(false)}
                                >
                                    {link.label}
                                </Link>
                            ))}
                            <div className="h-px bg-white/5 my-2" />
                            {!loading && (
                                <>
                                    {user ? (
                                        <>
                                            <p className="text-sm text-muted-foreground px-2">{user.email}</p>
                                            <Button variant="ghost" size="sm" onClick={() => { handleSignOut(); setIsOpen(false); }} className="justify-start">
                                                Logout
                                            </Button>
                                        </>
                                    ) : (
                                        <Link href="/login" onClick={() => setIsOpen(false)}>
                                            <Button variant="outline" className="w-full">Login</Button>
                                        </Link>
                                    )}
                                </>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </header>
    )
}
