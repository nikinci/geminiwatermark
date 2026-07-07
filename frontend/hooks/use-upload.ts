import { useState, useCallback, ChangeEvent, DragEvent, useEffect } from 'react';
import { removeWatermark, removeWatermarkBatch, getDownloadUrl, checkRemaining } from '@/lib/api';
import { useAuth } from '@/contexts/auth-context';
import { trackUpload, trackUploadSuccess, trackUploadError } from '@/lib/analytics';

export interface UploadItem {
    id: string;
    file: File;
    status: 'pending' | 'uploading' | 'success' | 'error';
    progress: number;
    error: string | null;
    errorCode?: string | null;
    downloadUrl: string | null;
    originalPreview: string; // URL
    processedPreview: string | null; // URL
}

interface UseUploadProps {
    onFilesAccepted?: (files: File[]) => void;
}

export function useUpload({ onFilesAccepted }: UseUploadProps = {}) {
    const [items, setItems] = useState<UploadItem[]>([]);
    const [isUploading, setIsUploading] = useState(false);
    const [remaining, setRemaining] = useState<number | null>(null);
    const [limit, setLimit] = useState<number | null>(null);

    // --- Drag & Drop State ---
    const [isDragging, setIsDragging] = useState(false);
    const [dndError, setDndError] = useState<string | null>(null);

    // Use centralized auth hook
    const { user } = useAuth();

    const fetchRemaining = async () => {
        try {
            const data = await checkRemaining();
            setRemaining(data.remaining);
            setLimit(data.limit);
        } catch (e) {
            console.error('Failed to fetch remaining:', e);
        }
    };

    useEffect(() => {
        fetchRemaining();
    }, []);

    const processItem = async (item: UploadItem, userId?: string) => {
        // Update item status to uploading
        setItems(prev => prev.map(i => i.id === item.id ? { ...i, status: 'uploading', progress: 0 } : i));

        const progressInterval = setInterval(() => {
            setItems(prev => prev.map(i => {
                if (i.id === item.id && i.status === 'uploading') {
                    return { ...i, progress: Math.min(i.progress + Math.random() * 20, 90) };
                }
                return i;
            }));
        }, 300);

        try {
            const result = await removeWatermark(item.file, userId);
            clearInterval(progressInterval);

            if (result.success && result.download_id) {
                const downloadUrl = getDownloadUrl(result.download_id);
                setItems(prev => prev.map(i => i.id === item.id ? {
                    ...i,
                    status: 'success',
                    progress: 100,
                    downloadUrl,
                    processedPreview: downloadUrl
                } : i));
                trackUploadSuccess();
                fetchRemaining();
            } else {
                const errorMsg = result.message || result.error || 'Processing failed';
                throw new Error(errorMsg);
            }
        } catch (e: any) {
            clearInterval(progressInterval);
            trackUploadError(e.message || 'Unknown Error');
            setItems(prev => prev.map(i => i.id === item.id ? {
                ...i,
                status: 'error',
                progress: 0,
                error: e.message || 'Error',
                errorCode: e.code || null
            } : i));
        }
    };

    // Backend accepts max 10 files per batch request; also keep each request
    // body well under Cloudflare's 100MB limit.
    const BATCH_CHUNK_FILES = 10;
    const BATCH_CHUNK_BYTES = 80 * 1024 * 1024;

    const chunkForBatch = (batchItems: UploadItem[]): UploadItem[][] => {
        const chunks: UploadItem[][] = [];
        let current: UploadItem[] = [];
        let currentBytes = 0;
        for (const item of batchItems) {
            if (current.length > 0 &&
                (current.length >= BATCH_CHUNK_FILES || currentBytes + item.file.size > BATCH_CHUNK_BYTES)) {
                chunks.push(current);
                current = [];
                currentBytes = 0;
            }
            current.push(item);
            currentBytes += item.file.size;
        }
        if (current.length > 0) chunks.push(current);
        return chunks;
    };

    // Pro: send a whole chunk in ONE request; the backend runs a single
    // tool invocation over all of them and returns per-file results.
    const processBatchChunk = async (chunkItems: UploadItem[], userId: string) => {
        const ids = new Set(chunkItems.map(i => i.id));
        setItems(prev => prev.map(i => ids.has(i.id) ? { ...i, status: 'uploading', progress: 0 } : i));

        const progressInterval = setInterval(() => {
            setItems(prev => prev.map(i => {
                if (ids.has(i.id) && i.status === 'uploading') {
                    return { ...i, progress: Math.min(i.progress + Math.random() * 15, 90) };
                }
                return i;
            }));
        }, 300);

        try {
            const res = await removeWatermarkBatch(chunkItems.map(i => i.file), userId);
            clearInterval(progressInterval);

            if (!res.success || !res.results) {
                throw new Error(res.message || res.error || 'Batch processing failed');
            }

            const results = res.results;
            setItems(prev => prev.map(i => {
                const idx = chunkItems.findIndex(c => c.id === i.id);
                if (idx === -1) return i;
                const r = results[idx];
                if (r?.success && r.download_id) {
                    const downloadUrl = getDownloadUrl(r.download_id);
                    return { ...i, status: 'success', progress: 100, downloadUrl, processedPreview: downloadUrl };
                }
                return {
                    ...i,
                    status: 'error',
                    progress: 0,
                    error: r?.message || r?.error || 'Processing failed',
                    errorCode: r?.code || null
                };
            }));

            results.forEach(r => {
                if (r.success) trackUploadSuccess();
                else trackUploadError(r.code || r.error || 'Unknown Error');
            });
        } catch (e: any) {
            clearInterval(progressInterval);
            trackUploadError(e.message || 'Unknown Error');
            setItems(prev => prev.map(i => ids.has(i.id) ? {
                ...i,
                status: 'error',
                progress: 0,
                error: e.message || 'Error',
                errorCode: null
            } : i));
        }
    };

    const upload = async (files: File[]) => {
        trackUpload();
        setIsUploading(true);
        setDndError(null);

        // Limit check: If NOT pro, take only first file.
        let filesToProcess = files;
        if (user && !user.is_pro && files.length > 1) {
            // If not pro, limit to 1
            filesToProcess = [files[0]];
            setDndError("Pro feature required for batch uploads. Processing first image only.");
        }
        // Also if not logged in
        if (!user && files.length > 1) {
            filesToProcess = [files[0]];
            setDndError("Login required for batch uploads. Processing first image only.");
        }

        const newItems: UploadItem[] = filesToProcess.map(file => ({
            id: Math.random().toString(36).substring(7),
            file,
            status: 'pending',
            progress: 0,
            error: null,
            downloadUrl: null,
            originalPreview: URL.createObjectURL(file), // create preview immediately
            processedPreview: null
        }));

        setItems(newItems);

        if (user?.is_pro && user.id && newItems.length > 1) {
            // Pro batch: chunked single-request processing.
            // Chunks run sequentially so a huge drop doesn't flood the server.
            for (const chunk of chunkForBatch(newItems)) {
                await processBatchChunk(chunk, user.id);
            }
        } else {
            await Promise.all(newItems.map(item => processItem(item, user?.id)));
        }

        fetchRemaining();
        setIsUploading(false);
    };

    const reset = () => {
        // Revoke object URLs to avoid leaks
        items.forEach(i => {
            if (i.originalPreview) URL.revokeObjectURL(i.originalPreview);
        });
        setItems([]);
        setIsUploading(false);
        setDndError(null);
    };

    const removeItem = (id: string) => {
        setItems(prev => {
            const item = prev.find(i => i.id === id);
            if (item?.originalPreview) URL.revokeObjectURL(item.originalPreview);
            return prev.filter(i => i.id !== id);
        });
    };

    // --- Drag & Drop Handlers ---
    const handleDragEnter = useCallback((e: DragEvent<HTMLElement>) => {
        e.preventDefault(); e.stopPropagation(); setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback((e: DragEvent<HTMLElement>) => {
        e.preventDefault(); e.stopPropagation(); setIsDragging(false);
    }, []);

    const handleDragOver = useCallback((e: DragEvent<HTMLElement>) => {
        e.preventDefault(); e.stopPropagation(); if (!isDragging) setIsDragging(true);
    }, [isDragging]);

    const validateFiles = (fileList: FileList): File[] => {
        const validFiles: File[] = [];
        const validTypes = ['image/jpeg', 'image/png', 'image/webp'];

        for (let i = 0; i < fileList.length; i++) {
            const file = fileList[i];
            if (!validTypes.includes(file.type)) {
                setDndError('Invalid file type. Please upload JPG, PNG, or WebP.');
                continue;
            }
            if (file.size > 25 * 1024 * 1024) {
                setDndError(`File ${file.name} too large. Max 25MB.`);
                continue;
            }
            validFiles.push(file);
        }
        return validFiles;
    };

    const handleDrop = useCallback((e: DragEvent<HTMLElement>) => {
        e.preventDefault(); e.stopPropagation(); setIsDragging(false);
        const files = e.dataTransfer.files;
        if (files && files.length > 0) {
            const valid = validateFiles(files);
            if (valid.length > 0) {
                if (onFilesAccepted) onFilesAccepted(valid);
            }
        }
    }, [onFilesAccepted]);

    const handleFileSelect = useCallback((e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const valid = validateFiles(e.target.files);
            if (valid.length > 0) {
                if (onFilesAccepted) onFilesAccepted(valid);
            }
        }
    }, [onFilesAccepted]);

    return {
        isUploading,
        items,
        upload,
        reset,
        removeItem,
        remaining,
        limit,
        user,
        fetchRemaining,
        isDragging,
        error: dndError,
        handleDragEnter,
        handleDragLeave,
        handleDragOver,
        handleDrop,
        handleFileSelect,
    };
}
