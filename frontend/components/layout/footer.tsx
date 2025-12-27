import Link from "next/link"
import { Zap } from "lucide-react"

export function Footer() {
    return (
        <footer className="border-t border-white/5 bg-black/20">
            <div className="container mx-auto px-4 py-12">
                <div className="grid md:grid-cols-4 gap-8 mb-8">
                    <div className="md:col-span-2 space-y-4">
                        <Link href="/" className="flex items-center gap-2 font-bold text-xl tracking-tight">
                            <div className="w-6 h-6 rounded-md bg-accent/20 flex items-center justify-center border border-accent/20">
                                <Zap className="w-3 h-3 text-accent fill-accent" />
                            </div>
                            <span className="text-lg">GeminiWatermark<span className="text-accent">.ai</span></span>
                        </Link>
                        <p className="text-muted-foreground text-sm max-w-sm">
                            The first AI-powered tool dedicated to removing visible watermarks from Google Gemini generated images.
                        </p>
                    </div>

                    <div>
                        <h4 className="font-semibold text-white mb-4">Product</h4>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                            <li><Link href="/features" className="hover:text-accent transition-colors">Features</Link></li>
                            <li><Link href="/pricing" className="hover:text-accent transition-colors">Pricing</Link></li>
                            <li><Link href="/#faq" className="hover:text-accent transition-colors">FAQ</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-semibold text-white mb-4">Legal</h4>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                            <li><Link href="/privacy" className="hover:text-accent transition-colors">Privacy Policy</Link></li>
                            <li><Link href="/terms" className="hover:text-accent transition-colors">Terms of Service</Link></li>
                            <li><Link href="/contact" className="hover:text-accent transition-colors">Contact</Link></li>
                        </ul>
                    </div>
                </div>

                <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
                    <p>© {new Date().getFullYear()} GeminiWatermark.ai. All rights reserved.</p>
                    <div className="flex gap-4">
                        {/* Socials placeholder */}
                    </div>
                </div>
            </div>
        </footer>
    )
}
