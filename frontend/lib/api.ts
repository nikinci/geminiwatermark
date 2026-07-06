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
