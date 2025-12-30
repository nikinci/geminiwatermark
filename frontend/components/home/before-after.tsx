"use client"

import { useState, useRef, useEffect } from "react"
import { motion } from "framer-motion"
import { ChevronsLeftRight, Download, Check } from "lucide-react"
import { trackDownload } from "@/lib/analytics"

interface BeforeAfterProps {
    originalUrl: string
    processedUrl: string
    onDownload?: () => void
    downloadUrl?: string
    buttonText?: string
    onAction?: () => void
}

export function BeforeAfter({ originalUrl, processedUrl, onDownload, downloadUrl, buttonText = "Download Image", onAction }: BeforeAfterProps) {
    const [sliderPosition, setSliderPosition] = useState(50)
    const [isDragging, setIsDragging] = useState(false)
    const containerRef = useRef<HTMLDivElement>(null)
    const [downloaded, setDownloaded] = useState(false)

    // Check if this is functioning as a download button
    const isDownloadButton = !!(onDownload || downloadUrl)

    const handleMove = (event: MouseEvent | TouchEvent) => {
        if (!containerRef.current) return

        const { left, width } = containerRef.current.getBoundingClientRect()
        let clientX

        if ('touches' in event) {
            clientX = event.touches[0].clientX
        } else {
            clientX = (event as MouseEvent).clientX
        }

        const position = ((clientX - left) / width) * 100
        setSliderPosition(Math.min(100, Math.max(0, position)))
    }

    const handleMouseDown = () => setIsDragging(true)
    const handleMouseUp = () => setIsDragging(false)

    useEffect(() => {
        const handleWindowMove = (e: MouseEvent | TouchEvent) => {
            if (!isDragging) return
            handleMove(e)
        }

        window.addEventListener("mouseup", handleMouseUp)
        window.addEventListener("mousemove", handleWindowMove)
        window.addEventListener("touchend", handleMouseUp)
        window.addEventListener("touchmove", handleWindowMove)

        return () => {
            window.removeEventListener("mouseup", handleMouseUp)
            window.removeEventListener("mousemove", handleWindowMove)
            window.removeEventListener("touchend", handleMouseUp)
            window.removeEventListener("touchmove", handleWindowMove)
        }
    }, [isDragging])

    const handleButtonClick = () => {
        if (onAction) {
            onAction()
            return
        }

        if (isDownloadButton) {
            trackDownload()
            if (onDownload) onDownload()
            if (downloadUrl) {
                const link = document.createElement('a')
                link.href = downloadUrl
                link.download = 'processed-image.png'
                document.body.appendChild(link)
                link.click()
                document.body.removeChild(link)
            }
            setDownloaded(true)
            setTimeout(() => setDownloaded(false), 2000)
        }
    }

    return (
        <section className="py-12 bg-card/50 rounded-3xl border border-border">
            <div className="container mx-auto px-4">
                <div className="text-center mb-8 space-y-4">
                    <h2 className="text-3xl font-bold text-white">
                        Watermark Removed!
                    </h2>
                    <p className="text-muted-foreground">
                        Drag the slider to compare.
                    </p>
                </div>

                <div className="relative max-w-4xl mx-auto aspect-video rounded-2xl overflow-hidden border border-border shadow-2xl mb-8">
                    <div
                        ref={containerRef}
                        className="relative w-full h-full select-none cursor-ew-resize"
                        onMouseDown={handleMouseDown}
                        onTouchStart={handleMouseDown}
                        onClick={(e) => {
                            const rect = e.currentTarget.getBoundingClientRect()
                            const x = e.clientX - rect.left
                            const pos = (x / rect.width) * 100
                            setSliderPosition(pos)
                        }}
                    >
                        {/* After Image (Background) */}
                        <div className="absolute inset-0">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={processedUrl} alt="After" className="w-full h-full object-contain bg-zinc-900" />
                        </div>

                        {/* Before Image (Foreground - Clipped) */}
                        <div
                            className="absolute inset-0 bg-zinc-900"
                            style={{ clipPath: `polygon(0 0, ${sliderPosition}% 0, ${sliderPosition}% 100%, 0 100%)` }}
                        >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={originalUrl} alt="Before" className="w-full h-full object-contain" />
                        </div>

                        {/* Slider Handle */}
                        <div
                            className="absolute top-0 bottom-0 w-1 bg-white cursor-ew-resize z-20 shadow-[0_0_20px_rgba(0,0,0,0.5)]"
                            style={{ left: `${sliderPosition}%` }}
                        >
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 md:w-12 md:h-12 bg-white rounded-full flex items-center justify-center shadow-lg text-black">
                                <ChevronsLeftRight className="w-4 h-4 md:w-6 md:h-6" />
                            </div>
                        </div>

                        {/* Labels */}
                        <div className="absolute top-4 left-4 bg-black/60 backdrop-blur px-3 py-1.5 rounded-lg text-xs md:text-sm font-medium z-10 pointer-events-none text-white border border-white/10">
                            Original
                        </div>
                        <div className="absolute top-4 right-4 bg-black/60 backdrop-blur px-3 py-1.5 rounded-lg text-xs md:text-sm font-medium z-10 pointer-events-none text-white border border-white/10">
                            Processed
                        </div>
                    </div>
                </div>

                <div className="flex justify-center">
                    <button
                        onClick={handleButtonClick}
                        className="inline-flex items-center gap-2 px-8 py-4 bg-accent hover:bg-accent-hover text-white rounded-full font-semibold text-lg transition-all shadow-lg hover:shadow-xl hover:scale-105 active:scale-95"
                    >
                        {isDownloadButton ? (
                            downloaded ? <Check className="w-5 h-5" /> : <Download className="w-5 h-5" />
                        ) : (
                            <span className="text-xl">✨</span>
                        )}
                        {isDownloadButton && downloaded ? "Downloaded!" : buttonText}
                    </button>
                </div>
            </div>
        </section>
    )
}

