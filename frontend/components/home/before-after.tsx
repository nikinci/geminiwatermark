"use client"

import { useState, useRef, useEffect } from "react"
import Image from "next/image"
import { motion } from "framer-motion"
import { ChevronsLeftRight } from "lucide-react"

export function BeforeAfter() {
    const [sliderPosition, setSliderPosition] = useState(50)
    const [isDragging, setIsDragging] = useState(false)
    const containerRef = useRef<HTMLDivElement>(null)

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

    return (
        <section className="py-24 bg-card/50">
            <div className="container mx-auto px-4">
                <div className="text-center mb-16 space-y-4">
                    <h2 className="text-3xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-white to-white/60">
                        See the Magic in Action
                    </h2>
                    <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
                        Drag the slider to see how AI removes visible watermarks while preserving image quality.
                    </p>
                </div>

                <div className="relative max-w-4xl mx-auto aspect-video rounded-3xl overflow-hidden border border-border shadow-2xl">
                    <div
                        ref={containerRef}
                        className="relative w-full h-full select-none cursor-ew-resize"
                        onMouseDown={handleMouseDown}
                        onTouchStart={handleMouseDown}
                        onClick={(e) => {
                            // Allow click to jump
                            const rect = e.currentTarget.getBoundingClientRect()
                            const x = e.clientX - rect.left
                            const pos = (x / rect.width) * 100
                            setSliderPosition(pos)
                        }}
                    >
                        {/* After Image (Background) */}
                        <div className="absolute inset-0">
                            {/* Placeholder until real image */}
                            <div className="w-full h-full bg-zinc-900 flex items-center justify-center text-zinc-700">
                                <span className="text-9xl font-black opacity-20">AFTER</span>
                            </div>
                            {/* Real image would be: <Image src="/images/demo-after.jpg" fill alt="After" className="object-cover" /> */}
                        </div>

                        {/* Before Image (Foreground - Clipped) */}
                        <div
                            className="absolute inset-0 bg-zinc-800"
                            style={{ clipPath: `polygon(0 0, ${sliderPosition}% 0, ${sliderPosition}% 100%, 0 100%)` }}
                        >
                            {/* Placeholder until real image */}
                            <div className="w-full h-full flex items-center justify-center text-zinc-600 relative">
                                <span className="text-9xl font-black opacity-20">BEFORE</span>
                                {/* Simulate watermark */}
                                <div className="absolute inset-0 bg-[url('https://placehold.co/100x100/333/444.png?text=WATERMARK')] opacity-10 mix-blend-overlay"></div>
                            </div>
                            {/* Real image would be: <Image src="/images/demo-before.jpg" fill alt="Before" className="object-cover" /> */}
                        </div>

                        {/* Slider Handle */}
                        <div
                            className="absolute top-0 bottom-0 w-1 bg-white cursor-ew-resize z-20 shadow-[0_0_20px_rgba(0,0,0,0.5)]"
                            style={{ left: `${sliderPosition}%` }}
                        >
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg text-black">
                                <ChevronsLeftRight className="w-6 h-6" />
                            </div>
                        </div>

                        {/* Labels */}
                        <div className="absolute top-8 left-8 bg-black/50 backdrop-blur px-4 py-2 rounded-lg text-sm font-medium z-10 pointer-events-none">
                            Original
                        </div>
                        <div className="absolute top-8 right-8 bg-black/50 backdrop-blur px-4 py-2 rounded-lg text-sm font-medium z-10 pointer-events-none">
                            Processed
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}
