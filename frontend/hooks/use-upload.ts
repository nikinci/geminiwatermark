import { useState, useCallback, ChangeEvent, DragEvent, useEffect } from 'react';
import { removeWatermark, getDownloadUrl, checkRemaining } from '@/lib/api';
import { createClient } from '@/lib/supabase/client';


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

import { trackUpload, trackUploadSuccess, trackUploadError } from '@/lib/analytics';

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
    const [user, setUser] = useState<any>(null);

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

    const fetchUser = async () => {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (user) {
            const { data: profile } = await supabase
                .from('profiles')
                .select('is_pro')
                .eq('id', user.id)
                .single()

            setUser({ ...user, is_pro: profile?.is_pro ?? false })
        } else {
            setUser(null)
        }
    };

    useEffect(() => {
        fetchUser();
        fetchRemaining();
    }, []);

    const upload = async (file: File) => {
        trackUpload(); // Track start

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
            // Get User ID if logged in
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();

            const result = await removeWatermark(file, user?.id);

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
                trackUploadSuccess(); // Track success
                fetchRemaining(); // Update remaining count
            } else {
                const error = new Error(result.message || result.error || 'Processing failed');
                (error as any).code = result.code;
                throw error;
            }
        } catch (e: any) {
            clearInterval(progressInterval);
            trackUploadError(e.message || 'Unknown Error'); // Track error
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

        // Check file size (e.g. 25MB)
        if (file.size > 25 * 1024 * 1024) {
            setDndError('File too large. Max size is 25MB.');
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
        user,
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
