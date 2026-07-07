import { ShieldCheck, Zap, Smartphone, CheckCircle2, Lock, Image as ImageIcon, Layers, Film, LucideIcon } from "lucide-react"

export interface Feature {
    slug: string
    icon: LucideIcon
    title: string
    description: string
    longDescription: string
    benefits: string[]
    useCases: string[]
    faq: { question: string; answer: string }[]
}

export const FEATURES: Feature[] = [
    {
        slug: "veo-video-removal",
        icon: Film,
        title: "Veo Video Removal",
        description: "Remove Google Veo and Gemini video watermarks — the diamond and the 'Veo' text — with zero quality loss and audio preserved.",
        longDescription: "Google Veo and Gemini 3.5 stamp a visible watermark on every generated video — a diamond logo or a small 'Veo' wordmark in the corner. Our video pipeline removes it frame by frame using the same mathematically precise reverse alpha blending as our image tool: no generative fill, no hallucinated pixels, no re-imagined content. The engine auto-detects which watermark your clip carries and where it sits (720p and 1080p, landscape or portrait), adapts the removal intensity per frame, keeps your audio track untouched, and outputs a video whose frame count, duration, and FPS match the original exactly.",
        benefits: [
            "Gemini diamond and 'Veo' text watermarks auto-detected",
            "720p & 1080p, landscape and portrait",
            "Audio preserved, tick-exact frame timing",
            "Deterministic math — no AI hallucination, no quality loss"
        ],
        useCases: [
            "Creators publishing Veo/Flow-generated clips on social media.",
            "Marketing teams producing AI video ads without visible branding.",
            "Filmmakers using Veo for pre-visualization and storyboards."
        ],
        faq: [
            {
                question: "How long does a video take to process?",
                answer: "Typically 1-3 minutes for a standard 8-second Veo clip. Jobs run in a queue with live progress, and your result stays downloadable for an hour."
            },
            {
                question: "Does it work on every Veo video?",
                answer: "It handles standard Veo/Gemini 720p and 1080p outputs automatically. Clips with heavy motion directly under the watermark can occasionally leave a faint residue on a few frames."
            }
        ]
    },
    {
        slug: "batch-processing",
        icon: Layers,
        title: "Batch Processing",
        description: "Drop multiple images at once and watch them all get cleaned in a single run. Built for Pro users who work in volume.",
        longDescription: "Stop cleaning images one by one. With Pro batch processing, you can drag and drop a whole set of Gemini images into the upload zone and our engine processes them together in optimized batches of up to 10 per run. Each image gets its own live status card — cleaned images become instantly downloadable, while images without a detectable watermark are clearly flagged. The detection engine loads once per batch instead of once per image, making bulk runs significantly faster than sequential uploads.",
        benefits: [
            "Upload up to 10 images per batch run",
            "Single-pass engine: faster than one-by-one processing",
            "Per-image status, preview and download",
            "Combine with unlimited Pro quota for any volume"
        ],
        useCases: [
            "Content creators cleaning a full day's worth of AI generations in one drop.",
            "E-commerce sellers preparing dozens of product visuals at once.",
            "Agencies and marketing teams handling client asset libraries in bulk."
        ],
        faq: [
            {
                question: "How many images can I upload at once?",
                answer: "Pro users can select or drag any number of images; they are processed in fast batches of up to 10 per run, one batch after another."
            },
            {
                question: "What happens if one image in the batch has no watermark?",
                answer: "Each image is handled independently. Images without a detectable watermark are flagged individually — the rest of the batch is still processed and downloadable."
            }
        ]
    },
    {
        slug: "lightning-fast-processing",
        icon: Zap,
        title: "Lightning Fast",
        description: "Process images in under 3 seconds using our optimized edge infrastructure.",
        longDescription: "Our AI engine is distributed across global edge nodes, ensuring that your image is processed by the server closest to you. This architecture allows for sub-3-second watermark removal, making it one of the fastest tools on the market. Whether you have one image or a hundred, our parallel processing pipeline handles the load instantly.",
        benefits: [
            "Sub-3-second processing time",
            "Global edge network",
            "Parallel processing for batch uploads",
            "Instant preview generation"
        ],
        useCases: [
            "E-commerce sellers needing to clean up product photos quickly.",
            "Content creators generating dozens of AI images daily.",
            "Designers who need a clean base image for further editing."
        ],
        faq: [
            {
                question: "How is it so fast?",
                answer: "We use lightweight, specialized AI models deployed on edge servers close to your location, minimizing latency."
            },
            {
                question: "Does speed affect quality?",
                answer: "Not at all. Our model is optimized for both speed and precision, ensuring high-quality output every time."
            }
        ]
    },
    {
        slug: "private-secure",
        icon: Lock,
        title: "100% Private",
        description: "Your images are processed in memory and immediately discarded. No storage, no snooping.",
        longDescription: "Privacy is our top priority. We employ a stateless processing architecture where your images are uploaded to ephemeral RAM storage, processed instantly, and wiped from memory required. We never write your user content to disk, and no human ever sees your uploads.",
        benefits: [
            "RAM-only processing",
            "No disk storage",
            "Auto-deletion after processing",
            "TLS encryption in transit"
        ],
        useCases: [
            "Enterprise users working with confidential assets.",
            "Privacy-conscious individuals who don't want their photos stored.",
            "Legal and medical professionals requiring strict data handling."
        ],
        faq: [
            {
                question: "Do you train AI on my images?",
                answer: "Absolutely not. Your images are deleted immediately after processing and are never used for training."
            },
            {
                question: "Is data encrypted?",
                answer: "Yes, all data transfer is protected by industry-standard TLS encryption."
            }
        ]
    },
    {
        slug: "quality-preserved",
        icon: ImageIcon,
        title: "Quality Preserved",
        description: "We only remove the watermark. Your image resolution and details remain untouched.",
        longDescription: "Unlike other tools that compress or resize your images, our AI model works on the pixel level to surgically remove only the watermark artifacts. The rest of your image remains bit-perfect, preserving the original resolution, file format, and color profiles.",
        benefits: [
            "No compression artifacts",
            "Original resolution maintained",
            "Support for 4K+ images",
            "ICC profile preservation"
        ],
        useCases: [
            "Photographers needing high-res outputs for print.",
            "Digital artists working with 4K+ midjourney or stable diffusion generations.",
            "Marketing agencies requiring pristine assets for campaigns."
        ],
        faq: [
            {
                question: "Does it support 4K images?",
                answer: "Yes, we support high-resolution images up to 4K and beyond without downscaling."
            },
            {
                question: "What file formats are supported?",
                answer: "We support processing of JPG, PNG, and WebP formats, maintaining the original format in the output."
            }
        ]
    },
    {
        slug: "gemini-optimized",
        icon: ShieldCheck,
        title: "Gemini Optimized",
        description: "Specifically tuned for Google's visible branding and logo artifacts used in Gemini images.",
        longDescription: "Our AI models are trained on a massive dataset of Google Gemini and Imagen 3 generated images. This specialization allows us to accurately detect and remove specific watermark patterns, semi-transparent logos, and 'generated by AI' badges with higher precision than generic object removers.",
        benefits: [
            "Tuned for Google Gemini logos",
            "Handles semi-transparent overlays",
            "Removes corner badges",
            "Updated for Imagen 3"
        ],
        useCases: [
            "Users of Google's Gemini Advanced for image generation.",
            "Developers integrating Imagen 3 API outputs.",
            "Bloggers using Gemini-generated illustrations."
        ],
        faq: [
            {
                question: "Does it work with SynthID?",
                answer: "No, this tool removes visible watermarks only. Invisible watermarks like SynthID are embedded at the pixel level and remain."
            },
            {
                question: "Why is it better than generic removers?",
                answer: "Generic tools often smudge the area. Our model knows exactly what the Gemini logo looks like and how to reconstruct the texture behind it."
            }
        ]
    },
    {
        slug: "no-signup",
        icon: CheckCircle2,
        title: "No Signup Required",
        description: "Start removing watermarks instantly. No email, no account, no friction.",
        longDescription: "We believe in friction-less tools. You shouldn't have to navigate a complex dashboard or hand over your email just to process an image. Our free tier is open to everyone, instantly. Just drag, drop, and download.",
        benefits: [
            "Instant access",
            "No email spam",
            "No credit card required for free tier",
            "Anonymous usage"
        ],
        useCases: [
            "Quick one-off tasks where speed is key.",
            "Users testing the tool capabilities before committing.",
            "Students and researchers needing quick results."
        ],
        faq: [
            {
                question: "Is there a limit on free use?",
                answer: "Yes, you can process up to 5 images per day for free without any account."
            },
            {
                question: "What if I need more?",
                answer: "For unlimited bulk processing, you can sign into a free account or upgrade to Pro."
            }
        ]
    },
    {
        slug: "mobile-ready",
        icon: Smartphone,
        title: "Works on Mobile",
        description: "Fully responsive design allowing you to clean images directly from your phone.",
        longDescription: "GeminiWatermark.ai is built with a mobile-first approach. Our responsive interface works perfectly on iOS and Android browsers, allowing you to clean up saved images or screenshots directly from your camera roll without needing a computer.",
        benefits: [
            "Responsive touch interface",
            "Works on iOS and Android",
            "Fast loading on mobile networks",
            "Touch-friendly controls"
        ],
        useCases: [
            "Social media managers posting directly from mobile.",
            "Casual users editing photos on the go.",
            "Tablet users (iPad/Android) wanting a desktop-class experience."
        ],
        faq: [
            {
                question: "Do I need an app?",
                answer: "No app required! It works directly in Chrome, Safari, or any mobile browser."
            },
            {
                question: "Is it as fast as desktop?",
                answer: "Yes, since processing happens in the cloud, your phone's speed doesn't matter. It's lightning fast everywhere."
            }
        ]
    }
]
