import { Metadata } from "next"
import { VideoClient } from "@/components/video/video-client"

export const metadata: Metadata = {
    title: "Remove Veo Video Watermark | GeminiWatermark.ai",
    description:
        "Remove Google Veo and Gemini video watermarks with pixel-precise reverse alpha blending. No quality loss, audio preserved. 720p and 1080p supported.",
    keywords: [
        "remove veo watermark",
        "veo video watermark remover",
        "gemini video watermark",
        "google veo watermark removal",
        "veo 3 watermark remover",
        "flow video watermark",
    ],
    alternates: {
        canonical: "/video",
    },
    openGraph: {
        title: "Remove Veo Video Watermarks - GeminiWatermark.ai",
        description:
            "Clean Google Veo & Gemini video watermarks with pixel-precise reverse alpha blending. Audio preserved, no quality loss.",
    },
}

export default function VideoPage() {
    return <VideoClient />
}
