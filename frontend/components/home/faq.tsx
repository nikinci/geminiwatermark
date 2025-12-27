"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"

const faqs = [
    {
        question: "What watermarks can this remove?",
        answer: "Our tool is specifically optimized to remove Google Gemini's visible logo watermarks found on AI-generated images."
    },
    {
        question: "Does this remove SynthID?",
        answer: "No, this tool only removes the visible logo watermark in the bottom-right corner. SynthID is an invisible watermark embedded at the pixel level and cannot be removed without destroying the image."
    },
    {
        question: "Is it really free?",
        answer: "Yes! You can process up to 3 images per day completely free. We also plan to offer premium plans for unlimited bulk processing in the future."
    },
    {
        question: "Is my image stored?",
        answer: "No. Your privacy is our top priority. Images are processed in-memory and are permanently deleted from our servers immediately after the cleaned version is generated."
    },
    {
        question: "How does it work technically?",
        answer: "We use advanced computer vision and specialized AI models trained to detect and inpaint the specific visible branding artifacts used by Gemini."
    },
    {
        question: "Does it work on mobile?",
        answer: "Absolutely. Our website is fully responsive and works great on iOS and Android devices directly in the browser."
    }
]

export function FAQ() {
    const [openIndex, setOpenIndex] = useState<number | null>(null)

    return (
        <section className="py-24">
            <div className="container mx-auto px-4 max-w-3xl">
                <div className="text-center mb-16 space-y-4">
                    <h2 className="text-3xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-white to-white/60">
                        Frequently Asked Questions
                    </h2>
                    <p className="text-muted-foreground text-lg">
                        Got questions? We've got answers.
                    </p>
                </div>

                <div className="space-y-4">
                    {faqs.map((faq, i) => (
                        <div
                            key={i}
                            className="border border-border rounded-xl bg-card overflow-hidden"
                        >
                            <button
                                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                                className="w-full flex items-center justify-between p-6 text-left hover:bg-zinc-800/50 transition-colors"
                            >
                                <span className="font-semibold text-lg">{faq.question}</span>
                                <ChevronDown className={cn("w-5 h-5 transition-transform duration-300", openIndex === i && "rotate-180")} />
                            </button>

                            <AnimatePresence>
                                {openIndex === i && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: "auto", opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        <div className="px-6 pb-6 text-muted-foreground leading-relaxed">
                                            {faq.answer}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}
