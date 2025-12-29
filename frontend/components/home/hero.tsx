"use client"

import { motion } from "framer-motion"
import { useEffect } from "react"
import { UploadZone } from "./upload-zone"
import { useUpload } from "@/hooks/use-upload"
import { BeforeAfter } from "./before-after"
import { trackDownload, trackProcessAnother, trackTryAgain } from "@/lib/analytics"

export function Hero() {
    const { upload, items, isUploading, error, remaining, fetchRemaining, reset, user } = useUpload()

    const handleFileSelect = async (files: File[]) => {
        await upload(files)
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
                        {remaining !== null && !user?.is_pro && (
                            <span className="block mt-4 text-sm text-muted-foreground font-mono bg-white/5 inline-block px-3 py-1 rounded-md border border-white/10">
                                Remaining credits: <span className="text-accent font-bold">{remaining}</span>/3
                            </span>
                        )}
                    </p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="max-w-4xl mx-auto"
                >
                    {items.length === 0 && (
                        <UploadZone onFileSelect={handleFileSelect} />
                    )}

                    {/* Single Item View */}
                    {items.length === 1 && (
                        <>
                            {items[0].status === 'uploading' && (
                                <div className="bg-card/50 backdrop-blur-sm border border-border rounded-xl p-8 max-w-lg mx-auto">
                                    <h3 className="text-xl font-semibold mb-6 flex items-center justify-center gap-2">
                                        <span className="animate-spin">⏳</span> Processing Image...
                                    </h3>
                                    <div className="w-full bg-muted/50 rounded-full h-4 overflow-hidden mb-4">
                                        <motion.div
                                            className="bg-accent h-full rounded-full"
                                            initial={{ width: 0 }}
                                            animate={{ width: `${items[0].progress}%` }}
                                            transition={{ duration: 0.3 }}
                                        />
                                    </div>
                                    <p className="text-sm text-muted-foreground animate-pulse">
                                        Analyzing watermark pattern... {Math.round(items[0].progress)}%
                                    </p>
                                </div>
                            )}

                            {items[0].status === 'success' && items[0].originalPreview && items[0].processedPreview && (
                                <div className="space-y-8 animate-in fade-in zoom-in duration-500">
                                    <BeforeAfter
                                        originalUrl={items[0].originalPreview}
                                        processedUrl={items[0].processedPreview}
                                        onDownload={() => {
                                            trackDownload()
                                            if (items[0].downloadUrl) window.open(items[0].downloadUrl, '_blank');
                                        }}
                                    />
                                    <button
                                        onClick={() => {
                                            trackProcessAnother()
                                            reset()
                                        }}
                                        className="text-muted-foreground hover:text-white underline underline-offset-4 text-sm transition-colors"
                                    >
                                        Process another image
                                    </button>
                                </div>
                            )}

                            {items[0].status === 'error' && (
                                <div className={`rounded-xl p-8 max-w-lg mx-auto border ${items[0].error?.includes('resolution') ? 'bg-yellow-500/10 border-yellow-500/20' : 'bg-red-500/10 border-red-500/20'}`}>
                                    <div className="text-5xl mb-4">{items[0].error?.includes('resolution') ? '⚠️' : '❌'}</div>
                                    <h3 className={`text-xl font-semibold mb-2 ${items[0].error?.includes('resolution') ? 'text-yellow-500' : 'text-red-500'}`}>
                                        {items[0].error?.includes('resolution') ? 'Image Quality Issue' : 'Processing Failed'}
                                    </h3>
                                    <p className={`${items[0].error?.includes('resolution') ? 'text-yellow-200/80' : 'text-red-400'} mb-6`}>
                                        {items[0].error}
                                    </p>
                                    {/* Specific advice for low resolution */}
                                    {items[0].error?.includes('resolution') && (
                                        <div className="text-sm text-left bg-black/20 p-4 rounded-lg mb-6 space-y-2">
                                            <p className="font-semibold text-yellow-500">How to fix:</p>
                                            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                                                <li>If on mobile: Select <strong>Actual Size (Gerçek Boyut)</strong> when uploading.</li>
                                                <li>Do not upload thumbnails or screenshots.</li>
                                                <li>Download the <strong>original</strong> image from Google Gemini web.</li>
                                            </ul>
                                        </div>
                                    )}
                                    <button
                                        onClick={() => {
                                            trackTryAgain()
                                            reset()
                                        }}
                                        className="px-6 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors font-medium"
                                    >
                                        Try Again
                                    </button>
                                </div>
                            )}
                        </>
                    )}

                    {/* Batch View (Grid) */}
                    {items.length > 1 && (
                        <div className="space-y-8 animate-in fade-in zoom-in duration-500">
                            <div className="flex items-center justify-center gap-4 mb-4">
                                <h2 className="text-2xl font-bold">Batch Processing ({items.length})</h2>
                                <button
                                    onClick={() => {
                                        trackProcessAnother()
                                        reset()
                                    }}
                                    className="text-sm text-muted-foreground hover:text-white underline"
                                >
                                    Clear All
                                </button>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                                {items.map((item, idx) => (
                                    <div key={item.id} className="relative rounded-xl overflow-hidden border border-white/10 bg-card/50 backdrop-blur-sm group">
                                        {/* Status Overlay */}
                                        <div className="absolute top-2 right-2 z-20">
                                            {item.status === 'uploading' && <span className="animate-spin text-accent">⏳</span>}
                                            {item.status === 'success' && <span className="text-green-500 bg-black/50 rounded-full p-1">✅</span>}
                                            {item.status === 'error' && <span className="text-red-500 bg-black/50 rounded-full p-1">❌</span>}
                                        </div>

                                        <div className="aspect-square relative">
                                            {/* Show Processed if ready, else Original */}
                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                            <img
                                                src={item.processedPreview || item.originalPreview}
                                                alt={`Item ${idx}`}
                                                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                                            />

                                            {/* Processing Overlay */}
                                            {item.status === 'uploading' && (
                                                <div className="absolute inset-0 bg-black/60 flex items-center justify-center flex-col p-4">
                                                    <p className="text-xs text-white/80 mb-2">Processing...</p>
                                                    <div className="w-full h-1 bg-white/20 rounded-full overflow-hidden">
                                                        <div className="h-full bg-accent" style={{ width: `${item.progress}%` }} />
                                                    </div>
                                                </div>
                                            )}

                                            {/* Error Overlay */}
                                            {item.status === 'error' && (
                                                <div className="absolute inset-0 bg-red-900/80 flex items-center justify-center p-4 text-center">
                                                    <p className="text-xs text-white">{item.error}</p>
                                                </div>
                                            )}

                                            {/* Hover Actions (Success only) */}
                                            {item.status === 'success' && (
                                                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                    <a
                                                        href={item.downloadUrl || '#'}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        onClick={() => trackDownload()}
                                                        className="px-4 py-2 bg-accent text-white text-sm rounded-lg font-medium hover:bg-accent/90 transition-transform hover:scale-105"
                                                    >
                                                        Download
                                                    </a>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Global Error (e.g. invalid file type or limit) */}
                    {error && items.length === 0 && (
                        <div className="mt-8 rounded-xl p-4 bg-red-500/10 border border-red-500/20 text-red-500 max-w-lg mx-auto flex items-center justify-center gap-2">
                            <span className="text-xl">⚠️</span>
                            {error}
                        </div>
                    )}
                </motion.div>
            </div>
        </section>
    )
}
