"use client"

import { useRef } from "react"
import { Upload, FileImage, AlertCircle } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { useUpload } from "@/hooks/use-upload"
import { cn } from "@/lib/utils"

interface UploadZoneProps {
    onFileSelect: (file: File) => void
}

export function UploadZone({ onFileSelect }: UploadZoneProps) {
    const inputRef = useRef<HTMLInputElement>(null)

    const {
        isDragging,
        error,
        handleDragEnter,
        handleDragLeave,
        handleDragOver,
        handleDrop,
        handleFileSelect,
        user,
    } = useUpload({
        onFileAccepted: onFileSelect,
    })

    return (
        <div className="w-full max-w-xl mx-auto">
            <div
                onClick={() => inputRef.current?.click()}
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                className={cn(
                    "relative group cursor-pointer overflow-hidden rounded-2xl border-2 border-dashed transition-all duration-300",
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
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleFileSelect}
                />

                <div className="absolute inset-0 bg-gradient-to-tr from-accent/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                <div className="relative z-10 flex flex-col items-center gap-4">
                    <div className={cn(
                        "p-4 rounded-full bg-background/50 backdrop-blur-sm border border-border shadow-sm transition-transform duration-300 group-hover:scale-110",
                        isDragging && "bg-accent/10 border-accent/20 text-accent"
                    )}>
                        <Upload className="w-8 h-8 text-muted-foreground group-hover:text-accent transition-colors" />
                    </div>

                    <div className="space-y-2">
                        <h3 className="text-xl font-semibold tracking-tight">
                            {isDragging ? "Drop image here" : "Upload an image"}
                        </h3>
                        <p className="text-sm text-muted-foreground max-w-[280px]">
                            Drag & drop or click to upload. <br />
                            Support for JPG, PNG, WebP up to 25MB
                        </p>
                    </div>

                    <Button variant={isDragging ? "accent" : "secondary"} className="mt-2">
                        Select File
                    </Button>
                </div>

                {/* Error State */}
                <AnimatePresence>
                    {error && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 10 }}
                            className="absolute bottom-4 left-0 right-0 mx-4"
                        >
                            <div className="flex items-center justify-center gap-2 text-sm text-red-400 bg-red-950/30 p-2 rounded-lg border border-red-900/50 backdrop-blur-md">
                                <AlertCircle className="w-4 h-4" />
                                <span>{error}</span>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            <div className="mt-6 flex items-center justify-center gap-6 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                    100% Private
                </div>
                {user?.is_pro ? (
                    <>
                        <div className="flex items-center gap-2 text-accent font-medium animate-pulse">
                            <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                            Unlimited Access
                        </div>
                        <div className="flex items-center gap-2 text-accent font-medium">
                            <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                            Pro Member
                        </div>
                    </>
                ) : (
                    <>
                        <div className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                            Free 3/Day
                        </div>
                        {!user && (
                            <div className="flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                                No Signup
                            </div>
                        )}
                        {user && (
                            <div className="flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                                Basic Plan
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    )
}
