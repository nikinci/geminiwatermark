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

export function getDownloadUrl(downloadId: string): string {
    return `${API_URL}/api/download/${downloadId}`;
}
