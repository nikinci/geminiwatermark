import { useState, useCallback, ChangeEvent, DragEvent, useEffect } from 'react';
import { removeWatermark, getDownloadUrl, checkRemaining } from '@/lib/api';
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

    // --- Drag & Drop State ---
    const [isDragging, setIsDragging] = useState(false);
    const [dndError, setDndError] = useState<string | null>(null);

    // Use centralized auth hook
    const { user } = useAuth();

    const fetchRemaining = async () => {
        try {
            const data = await checkRemaining();
            setRemaining(data.remaining);
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

    const upload = async (files: File[]) => {
        trackUpload();
        setIsUploading(true);
        setDndError(null);

        // Limit check: If NOT pro, take only first file.
        // Actually, we should probably throw an error or warn if >1 but not pro.
        // For better UX: If not pro and multiple files, just slice(0, 1) and warn?
        // Or reject. Let's just user logic:
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

        // Process all (Concurrency: currently all at once. For 50+ images we might want a queue, but for <10 it's fine)
        // If we want sequential:
        /*
        for (const item of newItems) {
            await processItem(item, user?.id);
        }
        */
        // Parallel:
        await Promise.all(newItems.map(item => processItem(item, user?.id)));

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
