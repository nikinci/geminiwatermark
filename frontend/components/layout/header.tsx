"use client"

import { useState } from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { Menu, X, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"

const navLinks = [
    { href: "/features", label: "Features" },
    { href: "/pricing", label: "Pricing" },
    { href: "/contact", label: "Contact" },
]

export function Header() {
    const [isOpen, setIsOpen] = useState(false)

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
                    <Button variant="accent" size="sm" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
                        Remove Watermark
                    </Button>
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
                            <Button className="w-full" variant="accent" onClick={() => { setIsOpen(false); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>
                                Remove Watermark
                            </Button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </header>
    )
}
