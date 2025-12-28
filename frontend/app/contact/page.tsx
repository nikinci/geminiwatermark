import { Metadata } from "next"
import { ContactForm } from "@/components/contact/contact-form"

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

                    <ContactForm />
                </div>
            </div>
        </main>
    )
}
