"use client"

import { motion } from "framer-motion"
import { UploadZone } from "./upload-zone"

export function Hero() {
    const handleFileSelect = (file: File) => {
        console.log("File selected:", file)
        // TODO: Handle file upload logic
    }

    return (
        <section className="relative pt-20 pb-32 overflow-hidden">
            {/* Background blobs */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] opacity-30 pointer-events-none">
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-accent/20 rounded-full blur-3xl mix-blend-screen animate-pulse" />
                <div className="absolute top-20 right-1/4 w-72 h-72 bg-blue-500/20 rounded-full blur-3xl mix-blend-screen animate-pulse delay-1000" />
            </div>

            <div className="container relative mx-auto px-4 text-center">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="max-w-4xl mx-auto space-y-6 mb-12"
                >
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 border border-accent/20 text-accent text-sm font-medium mb-4">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-accent"></span>
                        </span>
                        New: Enhanced Watermark Removal
                    </div>

                    <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-white bg-clip-text text-transparent bg-gradient-to-b from-white to-white/60">
                        Remove Gemini Watermarks
                        <span className="block text-accent mt-2">in Seconds</span>
                    </h1>

                    <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                        The free AI-powered tool designed to remove Google Gemini's visible logo watermarks.
                        <span className="block mt-2 text-sm text-yellow-500/80 font-medium">
                            Note: This tool removes the visible watermark only. It does NOT remove invisible SynthID watermarks.
                        </span>
                    </p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                >
                    <UploadZone onFileSelect={handleFileSelect} />
                </motion.div>

                {/* Floating elements/logos could go here */}
            </div>
        </section>
    )
}
