import { useState, useCallback, ChangeEvent, DragEvent } from 'react';
import { removeWatermark, getDownloadUrl, checkRemaining } from '@/lib/api';
// import { normalizeImage } from '@/lib/image'; // Disable normalization

interface UploadState {
    status: 'idle' | 'uploading' | 'success' | 'error';
    progress: number;
    error: string | null;
    errorCode?: string | null;
    downloadUrl: string | null;
    originalPreview: string | null;
    processedPreview: string | null;
}

interface UseUploadProps {
    onFileAccepted?: (file: File) => void;
}

export function useUpload({ onFileAccepted }: UseUploadProps = {}) {
    // --- API / Processing State ---
    const [state, setState] = useState<UploadState>({
        status: 'idle',
        progress: 0,
        error: null,
        errorCode: null,
        downloadUrl: null,
        originalPreview: null,
        processedPreview: null,
    });

    const [remaining, setRemaining] = useState<number | null>(null);

    // --- Drag & Drop State ---
    const [isDragging, setIsDragging] = useState(false);
    const [dndError, setDndError] = useState<string | null>(null);


    const fetchRemaining = async () => {
        try {
            const data = await checkRemaining();
            setRemaining(data.remaining);
        } catch (e) {
            console.error('Failed to fetch remaining:', e);
        }
    };

    const upload = async (file: File) => {
        // Create preview of original
        const originalPreview = URL.createObjectURL(file);

        setState({
            status: 'uploading',
            progress: 0,
            error: null,
            errorCode: null,
            downloadUrl: null,
            originalPreview,
            processedPreview: null,
        });

        // Simulate progress
        const progressInterval = setInterval(() => {
            setState(prev => ({
                ...prev,
                progress: Math.min(prev.progress + Math.random() * 20, 90),
            }));
        }, 300);

        try {
            // REVERT: Normalization (re-encoding) causes artifacts/failure in the backend tool
            // We send the original file directly.

            const result = await removeWatermark(file);

            clearInterval(progressInterval);

            if (result.success && result.download_id) {
                const downloadUrl = getDownloadUrl(result.download_id);
                setState({
                    status: 'success',
                    progress: 100,
                    error: null,
                    errorCode: null,
                    downloadUrl,
                    originalPreview,
                    processedPreview: downloadUrl,
                });
                fetchRemaining(); // Update remaining count
            } else {
                const error = new Error(result.message || result.error || 'Processing failed');
                (error as any).code = result.code;
                throw error;
            }
        } catch (e: any) {
            clearInterval(progressInterval);
            setState({
                status: 'error',
                progress: 0,
                error: e.message || 'Something went wrong',
                errorCode: e.code || null,
                downloadUrl: null,
                originalPreview: null,
                processedPreview: null,
            });
        }
    };

    const reset = () => {
        setState({
            status: 'idle',
            progress: 0,
            error: null,
            errorCode: null,
            downloadUrl: null,
            originalPreview: null,
            processedPreview: null,
        });
        setDndError(null);
    };

    // --- Drag & Drop Handlers ---

    const handleDragEnter = useCallback((e: DragEvent<HTMLElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback((e: DragEvent<HTMLElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    }, []);

    const handleDragOver = useCallback((e: DragEvent<HTMLElement>) => {
        e.preventDefault();
        e.stopPropagation();
        if (!isDragging) setIsDragging(true);
    }, [isDragging]);

    const validateAndAcceptFile = useCallback((file: File) => {
        // Check file type
        const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
        if (!validTypes.includes(file.type)) {
            setDndError('Invalid file type. Please upload a JPG, PNG, or WebP image.');
            return;
        }

        // Check file size (e.g. 10MB)
        if (file.size > 10 * 1024 * 1024) {
            setDndError('File too large. Max size is 10MB.');
            return;
        }

        setDndError(null);
        if (onFileAccepted) {
            onFileAccepted(file);
        }
    }, [onFileAccepted]);

    const handleDrop = useCallback((e: DragEvent<HTMLElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);

        const files = e.dataTransfer.files;
        if (files && files.length > 0) {
            validateAndAcceptFile(files[0]);
        }
    }, [validateAndAcceptFile]);

    const handleFileSelect = useCallback((e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            validateAndAcceptFile(e.target.files[0]);
        }
    }, [validateAndAcceptFile]);


    return {
        ...state,
        remaining,
        upload,
        reset,
        fetchRemaining,
        // DnD props
        isDragging,
        error: state.error || dndError, // Merge generic error with DnD error
        handleDragEnter,
        handleDragLeave,
        handleDragOver,
        handleDrop,
        handleFileSelect,
    };
}
