"use client"

import { Upload, Zap, Download } from "lucide-react"

const steps = [
    {
        icon: Upload,
        title: "1. Upload Image",
        description: "Drag and drop your watermarked Gemini image into the upload box. We support JPG, PNG, and WebP."
    },
    {
        icon: Zap,
        title: "2. AI Processing",
        description: "Our advanced algorithm detects and removes the visible watermark pattern in milliseconds."
    },
    {
        icon: Download,
        title: "3. Download",
        description: "Get your clean, watermark-free image instantly. No credits, no quality loss."
    }
]

export function HowItWorks() {
    return (
        <section className="py-24 border-y border-border/50">
            <div className="container mx-auto px-4">
                <div className="text-center mb-16 space-y-4">
                    <h2 className="text-3xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-white to-white/60">
                        How It Works
                    </h2>
                    <p className="text-muted-foreground text-lg">
                        Simple, fast, and secure.
                    </p>
                </div>

                <div className="grid md:grid-cols-3 gap-12 relative">
                    {/* Connector Line (Desktop) */}
                    <div className="hidden md:block absolute top-12 left-[16%] right-[16%] h-0.5 bg-gradient-to-r from-accent/0 via-accent/20 to-accent/0" />

                    {steps.map((step, i) => (
                        <div key={i} className="relative flex flex-col items-center text-center space-y-6">
                            <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-zinc-800 to-zinc-900 border border-zinc-700 flex items-center justify-center shadow-xl relative z-10">
                                <step.icon className="w-10 h-10 text-accent" />
                                <div className="absolute inset-0 bg-accent/5 rounded-2xl blur-xl -z-10" />
                            </div>

                            <div className="space-y-2 max-w-xs">
                                <h3 className="text-xl font-semibold">{step.title}</h3>
                                <p className="text-muted-foreground leading-relaxed">
                                    {step.description}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}
