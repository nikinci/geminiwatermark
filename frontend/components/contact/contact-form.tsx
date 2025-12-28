"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"

export function ContactForm() {
    const [isLoading, setIsLoading] = useState(false)
    const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle')

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setIsLoading(true)
        setStatus('idle')

        const form = e.currentTarget
        const formData = new FormData(form)
        const data = {
            email: formData.get('email'),
            subject: formData.get('subject'),
            message: formData.get('message'),
        }

        try {
            const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001'
            const res = await fetch(`${API_URL}/api/contact`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            })

            if (!res.ok) throw new Error('Failed to send')

            setStatus('success')
            // Reset form
            form.reset()
        } catch (error) {
            console.error(error)
            setStatus('error')
        } finally {
            setIsLoading(false)
        }
    }

    if (status === 'success') {
        return (
            <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-8 text-center animate-in fade-in zoom-in">
                <div className="text-5xl mb-4">✅</div>
                <h3 className="text-xl font-semibold text-green-500 mb-2">Message Sent!</h3>
                <p className="text-green-400 mb-6">Thanks for reaching out. We'll get back to you shortly.</p>
                <Button variant="outline" onClick={() => setStatus('idle')} className="border-green-500/50 text-green-500 hover:bg-green-500/10">
                    Send another message
                </Button>
            </div>
        )
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium">Email</label>
                <input
                    type="email"
                    name="email"
                    id="email"
                    className="w-full px-4 py-2 rounded-lg bg-secondary border border-border focus:ring-2 focus:ring-accent focus:outline-none transition-all"
                    placeholder="you@example.com"
                    required
                    disabled={isLoading}
                />
            </div>

            <div className="space-y-2">
                <label htmlFor="subject" className="text-sm font-medium">Subject</label>
                <select
                    name="subject"
                    id="subject"
                    className="w-full px-4 py-2 rounded-lg bg-secondary border border-border focus:ring-2 focus:ring-accent focus:outline-none transition-all"
                    disabled={isLoading}
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
                    name="message"
                    id="message"
                    rows={5}
                    className="w-full px-4 py-2 rounded-lg bg-secondary border border-border focus:ring-2 focus:ring-accent focus:outline-none transition-all resize-none"
                    placeholder="How can we help?"
                    required
                    disabled={isLoading}
                />
            </div>

            {status === 'error' && (
                <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-sm">
                    ⚠️ Something went wrong. Please try again later.
                </div>
            )}

            <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                    <span className="flex items-center gap-2">
                        <span className="animate-spin">⏳</span> Sending...
                    </span>
                ) : (
                    'Send Message'
                )}
            </Button>
        </form>
    )
}
