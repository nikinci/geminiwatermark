import { useState, useCallback, ChangeEvent, DragEvent } from "react"

interface UseUploadProps {
    onFileAccepted: (file: File) => void
    maxSize?: number // in bytes
    acceptedTypes?: string[]
}

export function useUpload({
    onFileAccepted,
    maxSize = 10 * 1024 * 1024, // 10MB default
    acceptedTypes = ["image/jpeg", "image/png", "image/webp"],
}: UseUploadProps) {
    const [isDragging, setIsDragging] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const validateFile = useCallback(
        (file: File) => {
            if (!acceptedTypes.includes(file.type)) {
                setError("Invalid file type. Please upload JPG, PNG, or WebP.")
                return false
            }
            if (file.size > maxSize) {
                setError(`File size too large. Max size is ${maxSize / 1024 / 1024}MB.`)
                return false
            }
            return true
        },
        [acceptedTypes, maxSize]
    )

    const handleDragEnter = useCallback((e: DragEvent<HTMLDivElement>) => {
        e.preventDefault()
        e.stopPropagation()
        setIsDragging(true)
    }, [])

    const handleDragLeave = useCallback((e: DragEvent<HTMLDivElement>) => {
        e.preventDefault()
        e.stopPropagation()
        // Only set dragging to false if we're actually leaving the dropped zone
        if (e.currentTarget.contains(e.relatedTarget as Node)) return
        setIsDragging(false)
    }, [])

    const handleDragOver = useCallback((e: DragEvent<HTMLDivElement>) => {
        e.preventDefault()
        e.stopPropagation()
    }, [])

    const handleDrop = useCallback(
        (e: DragEvent<HTMLDivElement>) => {
            e.preventDefault()
            e.stopPropagation()
            setIsDragging(false)
            setError(null)

            const files = e.dataTransfer.files
            if (files && files.length > 0) {
                const file = files[0]
                if (validateFile(file)) {
                    onFileAccepted(file)
                }
            }
        },
        [onFileAccepted, validateFile]
    )

    const handleFileSelect = useCallback(
        (e: ChangeEvent<HTMLInputElement>) => {
            setError(null)
            const files = e.target.files
            if (files && files.length > 0) {
                const file = files[0]
                if (validateFile(file)) {
                    onFileAccepted(file)
                }
            }
        },
        [onFileAccepted, validateFile]
    )

    return {
        isDragging,
        error,
        handleDragEnter,
        handleDragLeave,
        handleDragOver,
        handleDrop,
        handleFileSelect,
    }
}
