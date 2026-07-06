const API_URL = process.env.NEXT_PUBLIC_API_URL || '';

export async function checkRemaining(): Promise<{ remaining: number; limit: number }> {
    const res = await fetch(`${API_URL}/api/remaining`);
    return res.json();
}

export async function removeWatermark(file: File, userId?: string): Promise<{ success: boolean; download_id: string; error?: string; code?: string; message?: string }> {
    const formData = new FormData();
    formData.append('file', file);
    if (userId) {
        formData.append('user_id', userId);
    }

    const res = await fetch(`${API_URL}/api/remove`, {
        method: 'POST',
        body: formData,
    });

    return res.json();
}

export interface BatchFileResult {
    name: string;
    success: boolean;
    download_id?: string;
    filename?: string;
    error?: string;
    code?: string;
    message?: string;
}

export interface BatchResponse {
    success: boolean;
    processed?: number;
    total?: number;
    results?: BatchFileResult[];
    error?: string;
    code?: string;
    message?: string;
}

// Pro only: single request, single tool invocation on the server.
// Results come back in the same order as the files were appended.
export async function removeWatermarkBatch(files: File[], userId: string): Promise<BatchResponse> {
    const formData = new FormData();
    files.forEach(file => formData.append('files', file));
    formData.append('user_id', userId);

    const res = await fetch(`${API_URL}/api/remove-batch`, {
        method: 'POST',
        body: formData,
    });

    return res.json();
}

export function getDownloadUrl(downloadId: string): string {
    return `${API_URL}/api/download/${downloadId}`;
}

// --- Video (Veo) watermark removal: async job API ---

export interface VideoJobResponse {
    success?: boolean;
    job_id?: string;
    queue_position?: number;
    remaining_today?: number;
    error?: string;
    code?: string;
}

export interface VideoStatusResponse {
    job_id?: string;
    status: 'queued' | 'processing' | 'done' | 'no_watermark' | 'error';
    progress: number;
    queue_position?: number;
    error?: string;
}

export async function removeVideoWatermark(file: File, userId: string): Promise<VideoJobResponse> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('user_id', userId);

    const res = await fetch(`${API_URL}/api/video/remove`, {
        method: 'POST',
        body: formData,
    });

    return res.json();
}

export async function getVideoStatus(jobId: string): Promise<VideoStatusResponse> {
    const res = await fetch(`${API_URL}/api/video/status/${jobId}`);
    return res.json();
}

export function getVideoDownloadUrl(jobId: string): string {
    return `${API_URL}/api/video/download/${jobId}`;
}
