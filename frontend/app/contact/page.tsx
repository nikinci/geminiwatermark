import { Metadata } from "next"
import { Button } from "@/components/ui/button"

export const metadata: Metadata = {
    title: "Contact Us - GeminiWatermark",
    description: "Get in touch with support.",
}

export default function ContactPage() {
    return (
        <main className="min-h-screen pt-24 pb-12">
            <div className="container mx-auto px-4 max-w-xl">
                <div className="space-y-8">
                    <div className="space-y-2">
                        <h1 className="text-3xl font-bold">Contact Us</h1>
                        <p className="text-muted-foreground">
                            Have questions or feedback? We'd love to hear from you.
                        </p>
                    </div>

                    <form className="space-y-6">
                        <div className="space-y-2">
                            <label htmlFor="email" className="text-sm font-medium">Email</label>
                            <input
                                type="email"
                                id="email"
                                className="w-full px-4 py-2 rounded-lg bg-secondary border border-border focus:ring-2 focus:ring-accent focus:outline-none"
                                placeholder="you@example.com"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="subject" className="text-sm font-medium">Subject</label>
                            <select
                                id="subject"
                                className="w-full px-4 py-2 rounded-lg bg-secondary border border-border focus:ring-2 focus:ring-accent focus:outline-none"
                            >
                                <option>General Inquiry</option>
                                <option>Bug Report</option>
                                <option>Feature Request</option>
                                <option>Enterprise / API</option>
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="message" className="text-sm font-medium">Message</label>
                            <textarea
                                id="message"
                                rows={5}
                                className="w-full px-4 py-2 rounded-lg bg-secondary border border-border focus:ring-2 focus:ring-accent focus:outline-none"
                                placeholder="How can we help?"
                                required
                            />
                        </div>

                        <Button type="submit" className="w-full">
                            Send Message
                        </Button>
                    </form>
                </div>
            </div>
        </main>
    )
}
