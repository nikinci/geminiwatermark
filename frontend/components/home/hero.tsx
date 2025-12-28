"use client"

import { motion } from "framer-motion"
import { useEffect } from "react"
import { UploadZone } from "./upload-zone"
import { useUpload } from "@/hooks/use-upload"
import { BeforeAfter } from "./before-after"

export function Hero() {
    const { upload, status, progress, error, originalPreview, processedPreview, downloadUrl, remaining, fetchRemaining, reset } = useUpload()

    const handleFileSelect = async (file: File) => {
        await upload(file)
    }

    // Load remaining count on mount
    useEffect(() => {
        fetchRemaining()
    }, [])

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
                        {remaining !== null && (
                            <span className="block mt-4 text-sm text-muted-foreground font-mono bg-white/5 inline-block px-3 py-1 rounded-md border border-white/10">
                                Remaining credits: <span className="text-accent font-bold">{remaining}</span>/5
                            </span>
                        )}
                    </p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="max-w-3xl mx-auto"
                >
                    {status === 'idle' && (
                        <UploadZone onFileSelect={handleFileSelect} />
                    )}

                    {status === 'uploading' && (
                        <div className="bg-card/50 backdrop-blur-sm border border-border rounded-xl p-8 max-w-lg mx-auto">
                            <h3 className="text-xl font-semibold mb-6 flex items-center justify-center gap-2">
                                <span className="animate-spin">⏳</span> Processing Image...
                            </h3>
                            <div className="w-full bg-muted/50 rounded-full h-4 overflow-hidden mb-4">
                                <motion.div
                                    className="bg-accent h-full rounded-full"
                                    initial={{ width: 0 }}
                                    animate={{ width: `${progress}%` }}
                                    transition={{ duration: 0.3 }}
                                />
                            </div>
                            <p className="text-sm text-muted-foreground animate-pulse">
                                Analyzing watermark pattern... {Math.round(progress)}%
                            </p>
                        </div>
                    )}

                    {status === 'success' && originalPreview && processedPreview && (
                        <div className="space-y-8 animate-in fade-in zoom-in duration-500">
                            <BeforeAfter
                                originalUrl={originalPreview}
                                processedUrl={processedPreview}
                                onDownload={() => {
                                    if (downloadUrl) window.open(downloadUrl, '_blank');
                                }}
                            />
                            <button
                                onClick={reset}
                                className="text-muted-foreground hover:text-white underline underline-offset-4 text-sm transition-colors"
                            >
                                Process another image
                            </button>
                        </div>
                    )}

                    {status === 'error' && (
                        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-8 max-w-lg mx-auto">
                            <div className="text-red-500 text-5xl mb-4">⚠️</div>
                            <h3 className="text-xl font-semibold text-red-500 mb-2">Processing Failed</h3>
                            <p className="text-red-400 mb-6">{error}</p>
                            <button
                                onClick={reset}
                                className="px-6 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors font-medium"
                            >
                                Try Again
                            </button>
                        </div>
                    )}
                </motion.div>
            </div>
        </section>
    )
}
