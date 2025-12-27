"use client"

import { Button } from "@/components/ui/button"

export function CTASection() {
    return (
        <section className="py-24 relative overflow-hidden">
            <div className="absolute inset-0 bg-accent/5 -z-10" />
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-accent/10 rounded-full blur-[100px] -z-10 pointer-events-none" />

            <div className="container mx-auto px-4 text-center space-y-8">
                <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-white">
                    Ready to Remove Your First Watermark?
                </h2>
                <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                    Join thousands of users who trust us to clean their AI-generated images.
                </p>

                <div className="pt-4">
                    <Button
                        size="xl"
                        variant="accent"
                        className="text-lg px-12"
                        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                    >
                        Start Removing Now
                    </Button>
                </div>
            </div>
        </section>
    )
}
