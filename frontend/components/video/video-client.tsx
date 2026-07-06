"use client"

import { useState, useRef, useEffect, useCallback, DragEvent, ChangeEvent } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { Film, Upload, Download, AlertCircle, Loader2, Lock, Clock, ShieldCheck, Music, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/auth-context"
import { removeVideoWatermark, getVideoStatus, getVideoDownloadUrl } from "@/lib/api"
import { cn } from "@/lib/utils"

const MAX_VIDEO_SIZE = 100 * 1024 * 1024
const VALID_TYPES = ["video/mp4", "video/quicktime", "video/x-matroska"]
const VALID_EXTENSIONS = [".mp4", ".mov", ".mkv"]
const JOB_STORAGE_KEY = "veo_video_job"

type Phase = "idle" | "uploading" | "queued" | "processing" | "done" | "no_watermark" | "error"

const videoFaqs = [
    {
        question: "Which video watermarks can this remove?",
        answer: "It removes Google's visible video watermarks: the Gemini diamond (Gemini 3.5 / Veo outputs) and the small 'Veo' text used by Google Flow — auto-detected, in 720p and 1080p, landscape or portrait."
    },
    {
        question: "Does it reduce video quality?",
        answer: "No. The watermark is removed with mathematically precise reverse alpha blending — the same deterministic math as our image tool. The rest of the frame is untouched and your audio track is preserved as-is."
    },
    {
        question: "How long does processing take?",
        answer: "Typically 1-3 minutes for a standard 8-second Veo clip. Your video enters a processing queue and you can watch live progress — or come back later, your result stays available for an hour."
    },
    {
        question: "Is video watermark removal free?",
        answer: "Video processing is a Pro feature due to its heavy compute cost. Pro members can process up to 10 videos per day, along with unlimited image processing and batch uploads."
    }
]

export function VideoClient() {
    const { user, loading } = useAuth()
    const inputRef = useRef<HTMLInputElement>(null)
    const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)

    const [phase, setPhase] = useState<Phase>("idle")
    const [jobId, setJobId] = useState<string | null>(null)
    const [progress, setProgress] = useState(0)
    const [queuePosition, setQueuePosition] = useState<number | null>(null)
    const [errorMsg, setErrorMsg] = useState<string | null>(null)
    const [fileName, setFileName] = useState<string | null>(null)
    const [isDragging, setIsDragging] = useState(false)

    const stopPolling = () => {
        if (pollRef.current) {
            clearInterval(pollRef.current)
            pollRef.current = null
        }
    }

    const startPolling = useCallback((id: string) => {
        stopPolling()
        pollRef.current = setInterval(async () => {
            try {
                const status = await getVideoStatus(id)
                if (status.status === "queued") {
                    setPhase("queued")
                    setQueuePosition(status.queue_position ?? null)
                } else if (status.status === "processing") {
                    setPhase("processing")
                    setProgress(status.progress || 0)
                } else {
                    stopPolling()
                    localStorage.removeItem(JOB_STORAGE_KEY)
                    if (status.status === "done") {
                        setProgress(100)
                        setPhase("done")
                    } else if (status.status === "no_watermark") {
                        setErrorMsg(status.error || "No watermark detected in this video.")
                        setPhase("no_watermark")
                    } else {
                        setErrorMsg(status.error || "Processing failed.")
                        setPhase("error")
                    }
                }
            } catch {
                // transient network error - keep polling
            }
        }, 3000)
    }, [])

    // Resume an in-flight job after a page reload
    useEffect(() => {
        const saved = localStorage.getItem(JOB_STORAGE_KEY)
        if (saved) {
            try {
                const { id, name } = JSON.parse(saved)
                if (id) {
                    setJobId(id)
                    setFileName(name || null)
                    setPhase("queued")
                    startPolling(id)
                }
            } catch {
                localStorage.removeItem(JOB_STORAGE_KEY)
            }
        }
        return stopPolling
    }, [startPolling])

    const reset = () => {
        stopPolling()
        localStorage.removeItem(JOB_STORAGE_KEY)
        setPhase("idle")
        setJobId(null)
        setProgress(0)
        setQueuePosition(null)
        setErrorMsg(null)
        setFileName(null)
    }

    const handleFile = async (file: File) => {
        if (!user?.id) return
        const lower = file.name.toLowerCase()
        if (!VALID_TYPES.includes(file.type) && !VALID_EXTENSIONS.some(e => lower.endsWith(e))) {
            setErrorMsg("Invalid file type. Please upload an MP4, MOV, or MKV video.")
            setPhase("error")
            return
        }
        if (file.size > MAX_VIDEO_SIZE) {
            setErrorMsg("Video too large. Maximum size is 100MB.")
            setPhase("error")
            return
        }

        setFileName(file.name)
        setErrorMsg(null)
        setPhase("uploading")

        try {
            const res = await removeVideoWatermark(file, user.id)
            if (res.success && res.job_id) {
                setJobId(res.job_id)
                setQueuePosition(res.queue_position ?? null)
                setPhase("queued")
                localStorage.setItem(JOB_STORAGE_KEY, JSON.stringify({ id: res.job_id, name: file.name }))
                startPolling(res.job_id)
            } else {
                setErrorMsg(res.error || "Upload failed.")
                setPhase("error")
            }
        } catch {
            setErrorMsg("Upload failed. Check your connection and try again.")
            setPhase("error")
        }
    }

    const onDrop = useCallback((e: DragEvent<HTMLElement>) => {
        e.preventDefault(); e.stopPropagation(); setIsDragging(false)
        const file = e.dataTransfer.files?.[0]
        if (file) handleFile(file)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user])

    const onSelect = useCallback((e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) handleFile(file)
        e.target.value = ""
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user])

    const isPro = !!user?.is_pro
    const busy = phase === "uploading" || phase === "queued" || phase === "processing"

    return (
        <main className="min-h-screen pt-24 pb-16">
            <div className="container mx-auto px-4">
                {/* Hero */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="max-w-3xl mx-auto text-center space-y-6 mb-12"
                >
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 border border-accent/20 text-accent text-sm font-medium">
                        <Sparkles className="w-4 h-4" />
                        New — Veo Video Support
                    </div>
                    <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-white">
                        Remove Veo Video
                        <span className="block text-accent mt-2">Watermarks</span>
                    </h1>
                    <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                        Clean the Gemini diamond and "Veo" text watermarks from your AI-generated videos.
                        Pixel-precise reverse alpha blending — no quality loss, audio preserved.
                    </p>
                </motion.div>

                {/* Upload / Job area */}
                <div className="max-w-xl mx-auto mb-20">
                    {!loading && !isPro && (
                        <div className="rounded-2xl border border-accent/30 bg-card/60 p-10 text-center space-y-5">
                            <div className="mx-auto w-14 h-14 rounded-full bg-accent/10 flex items-center justify-center">
                                <Lock className="w-7 h-7 text-accent" />
                            </div>
                            <h2 className="text-2xl font-semibold">Video removal is a Pro feature</h2>
                            <p className="text-muted-foreground">
                                Video processing takes serious compute. Pro members get up to 10 videos per day,
                                plus unlimited images and batch uploads — for $4.99/month.
                            </p>
                            <div className="flex items-center justify-center gap-3 pt-2">
                                <Button variant="accent" asChild>
                                    <Link href="/pricing">Upgrade to Pro</Link>
                                </Button>
                                {!user && (
                                    <Button variant="secondary" asChild>
                                        <Link href="/login">Login</Link>
                                    </Button>
                                )}
                            </div>
                        </div>
                    )}

                    {!loading && isPro && phase === "idle" && (
                        <div
                            onClick={() => inputRef.current?.click()}
                            onDragEnter={(e) => { e.preventDefault(); setIsDragging(true) }}
                            onDragLeave={(e) => { e.preventDefault(); setIsDragging(false) }}
                            onDragOver={(e) => { e.preventDefault() }}
                            onDrop={onDrop}
                            className={cn(
                                "relative group cursor-pointer rounded-2xl border-2 border-dashed transition-all duration-300",
                                "h-64 flex flex-col items-center justify-center p-8 text-center",
                                isDragging
                                    ? "border-accent bg-accent/5 scale-[1.02] shadow-xl shadow-accent/10"
                                    : "border-border bg-card/50 hover:border-accent/50 hover:bg-card/80"
                            )}
                        >
                            <input
                                ref={inputRef}
                                type="file"
                                className="hidden"
                                accept="video/mp4,video/quicktime,video/x-matroska,.mp4,.mov,.mkv"
                                onChange={onSelect}
                            />
                            <div className="flex flex-col items-center gap-4">
                                <div className="p-4 rounded-full bg-background/50 border border-border shadow-sm group-hover:scale-110 transition-transform">
                                    <Film className="w-8 h-8 text-muted-foreground group-hover:text-accent transition-colors" />
                                </div>
                                <div className="space-y-2">
                                    <h3 className="text-xl font-semibold">
                                        {isDragging ? "Drop video here" : "Upload a video"}
                                    </h3>
                                    <p className="text-sm text-muted-foreground max-w-[300px]">
                                        Drag & drop or click to upload. <br />
                                        MP4, MOV, MKV up to 100MB — 10 videos/day
                                    </p>
                                </div>
                                <Button variant={isDragging ? "accent" : "secondary"} className="mt-1">
                                    Select Video
                                </Button>
                            </div>
                        </div>
                    )}

                    {busy && (
                        <div className="rounded-2xl border border-border bg-card/60 p-8 text-center space-y-6">
                            <div className="flex items-center justify-center gap-3">
                                <Loader2 className="w-6 h-6 text-accent animate-spin" />
                                <h3 className="text-xl font-semibold">
                                    {phase === "uploading" && "Uploading video..."}
                                    {phase === "queued" && (queuePosition && queuePosition > 1
                                        ? `In queue — position ${queuePosition}`
                                        : "Queued — starting soon...")}
                                    {phase === "processing" && "Removing watermark..."}
                                </h3>
                            </div>
                            {fileName && <p className="text-sm text-muted-foreground truncate">{fileName}</p>}
                            {phase === "processing" && (
                                <>
                                    <div className="w-full bg-muted/50 rounded-full h-3 overflow-hidden">
                                        <motion.div
                                            className="bg-accent h-full rounded-full"
                                            animate={{ width: `${progress}%` }}
                                            transition={{ duration: 0.4 }}
                                        />
                                    </div>
                                    <p className="text-sm text-muted-foreground">{progress}% — frame-by-frame reverse alpha blending</p>
                                </>
                            )}
                            <p className="text-xs text-muted-foreground/70">
                                This usually takes 1-3 minutes. You can leave this page — your job continues
                                and this page will pick it up when you return.
                            </p>
                        </div>
                    )}

                    {phase === "done" && jobId && (
                        <div className="rounded-2xl border border-green-800/50 bg-card/60 p-6 space-y-5 animate-in fade-in zoom-in duration-500">
                            <h3 className="text-xl font-semibold text-center">✅ Watermark removed!</h3>
                            <video
                                src={getVideoDownloadUrl(jobId)}
                                controls
                                playsInline
                                className="w-full rounded-xl border border-border max-h-[420px] bg-black"
                            />
                            <div className="flex items-center justify-center gap-4">
                                <Button variant="accent" asChild>
                                    <a href={getVideoDownloadUrl(jobId)}>
                                        <Download className="w-4 h-4 mr-2" /> Download Video
                                    </a>
                                </Button>
                                <button onClick={reset} className="text-sm text-muted-foreground hover:text-white underline underline-offset-4">
                                    Process another video
                                </button>
                            </div>
                            <p className="text-xs text-muted-foreground/70 text-center">
                                Files are deleted from our servers within an hour — download now.
                            </p>
                        </div>
                    )}

                    {(phase === "error" || phase === "no_watermark") && (
                        <div className={cn(
                            "rounded-2xl p-8 text-center border space-y-4",
                            phase === "no_watermark" ? "bg-yellow-500/10 border-yellow-500/20" : "bg-red-500/10 border-red-500/20"
                        )}>
                            <AlertCircle className={cn("w-10 h-10 mx-auto", phase === "no_watermark" ? "text-yellow-500" : "text-red-500")} />
                            <h3 className={cn("text-xl font-semibold", phase === "no_watermark" ? "text-yellow-500" : "text-red-500")}>
                                {phase === "no_watermark" ? "No Watermark Found" : "Processing Failed"}
                            </h3>
                            <p className="text-muted-foreground">{errorMsg}</p>
                            <Button variant="secondary" onClick={reset}>Try Another Video</Button>
                        </div>
                    )}
                </div>

                {/* Feature strip */}
                <div className="max-w-4xl mx-auto grid md:grid-cols-3 gap-6 mb-20">
                    {[
                        { icon: ShieldCheck, title: "No Quality Loss", desc: "Deterministic reverse alpha blending — no generative fill, no hallucinated pixels." },
                        { icon: Music, title: "Audio Preserved", desc: "Your original audio track is kept untouched, frame timing stays exact." },
                        { icon: Clock, title: "Auto-Detection", desc: "Gemini diamond & 'Veo' text watermarks detected automatically — 720p and 1080p." },
                    ].map((f, i) => (
                        <div key={i} className="p-6 rounded-2xl bg-zinc-900/50 border border-zinc-800 text-center space-y-3">
                            <f.icon className="w-7 h-7 text-accent mx-auto" />
                            <h3 className="font-semibold text-white">{f.title}</h3>
                            <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
                        </div>
                    ))}
                </div>

                {/* FAQ */}
                <div className="max-w-3xl mx-auto space-y-4">
                    <h2 className="text-3xl font-bold text-center mb-8">Video Watermark FAQ</h2>
                    {videoFaqs.map((faq, i) => (
                        <div key={i} className="border border-border rounded-xl bg-card p-6">
                            <h3 className="font-semibold text-lg mb-2">{faq.question}</h3>
                            <p className="text-muted-foreground leading-relaxed">{faq.answer}</p>
                        </div>
                    ))}
                </div>
            </div>

            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "FAQPage",
                        "mainEntity": videoFaqs.map(faq => ({
                            "@type": "Question",
                            "name": faq.question,
                            "acceptedAnswer": { "@type": "Answer", "text": faq.answer }
                        }))
                    })
                }}
            />
        </main>
    )
}
