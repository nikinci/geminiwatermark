import { ShieldCheck, Zap, Smartphone, CheckCircle2, Lock, Image as ImageIcon } from "lucide-react"

const features = [
    {
        icon: Zap,
        title: "Lightning Fast",
        description: "Process images in under 3 seconds using our optimized edge infrastructure."
    },
    {
        icon: Lock,
        title: "100% Private",
        description: "Your images are processed in memory and immediately discarded. No storage, no snooping."
    },
    {
        icon: ImageIcon,
        title: "Quality Preserved",
        description: "We only remove the watermark. Your image resolution and details remain untouched."
    },
    {
        icon: ShieldCheck,
        title: "Gemini Optimized",
        description: "Specifically tuned for Google's visible branding and logo artifacts used in Gemini images."
    },
    {
        icon: CheckCircle2,
        title: "No Signup Required",
        description: "Start removing watermarks instantly. No email, no account, no friction."
    },
    {
        icon: Smartphone,
        title: "Works on Mobile",
        description: "Fully responsive design allowing you to clean images directly from your phone."
    }
]

export function FeaturesGrid() {
    return (
        <section className="py-24 bg-card/30">
            <div className="container mx-auto px-4">
                <div className="text-center mb-16 space-y-4">
                    <h2 className="text-3xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-white to-white/60">
                        Why Choose Us?
                    </h2>
                    <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
                        Built for speed, privacy, and quality.
                    </p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {features.map((feature, i) => (
                        <div key={i} className="p-8 rounded-3xl bg-zinc-900/50 border border-zinc-800 hover:border-accent/30 hover:bg-zinc-800/50 transition-all duration-300 group">
                            <div className="flex flex-col gap-6">
                                <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center group-hover:bg-accent/20 transition-colors">
                                    <feature.icon className="w-6 h-6 text-accent" />
                                </div>
                                <div className="space-y-2">
                                    <h3 className="text-xl font-semibold text-white">{feature.title}</h3>
                                    <p className="text-muted-foreground leading-relaxed">
                                        {feature.description}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}
