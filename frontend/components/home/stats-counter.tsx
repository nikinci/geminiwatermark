"use client"

import { motion } from "framer-motion"

const stats = [
    { value: "50,000+", label: "Images Processed" },
    { value: "4.9/5", label: "User Rating" },
    { value: "< 3s", label: "Processing Time" },
]

export function StatsCounter() {
    return (
        <section className="py-12 border-y border-border/50 bg-zinc-900/20">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 divide-y md:divide-y-0 md:divide-x divide-border">
                    {stats.map((stat, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, scale: 0.9 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: i * 0.1 }}
                            className="text-center pt-8 md:pt-0"
                        >
                            <div className="text-4xl md:text-5xl font-bold text-white mb-2">
                                {stat.value}
                            </div>
                            <div className="text-muted-foreground font-medium uppercase tracking-wider text-sm">
                                {stat.label}
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    )
}
