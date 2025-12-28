/**
 * Normalizes an image file by drawing it to a canvas and exporting as PNG.
 * This ensures:
 * 1. EXIF rotation is applied (baked in).
 * 2. Metadata is stripped.
 * 3. Format is standardized (lossless PNG).
 * 4. Resolution is capped (optional, but good for performance).
 */
export async function normalizeImage(file: File, maxWidth = 2048): Promise<File> {
    return new Promise((resolve, reject) => {
        const img = new Image();
        const url = URL.createObjectURL(file);

        img.onload = () => {
            URL.revokeObjectURL(url);

            // Calculate new dimensions
            let width = img.width;
            let height = img.height;

            if (width > maxWidth) {
                height = Math.round((height * maxWidth) / width);
                width = maxWidth;
            }

            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;

            const ctx = canvas.getContext('2d');
            if (!ctx) {
                reject(new Error('Failed to get canvas context'));
                return;
            }

            // Draw image (browser handles EXIF orientation usually)
            ctx.drawImage(img, 0, 0, width, height);

            // Export as PNG (lossless)
            canvas.toBlob((blob) => {
                if (blob) {
                    const newFile = new File([blob], file.name.replace(/\.[^/.]+$/, "") + ".png", {
                        type: 'image/png',
                        lastModified: Date.now(),
                    });
                    resolve(newFile);
                } else {
                    reject(new Error('Failed to create blob'));
                }
            }, 'image/png');
        };

        img.onerror = () => {
            URL.revokeObjectURL(url);
            reject(new Error('Failed to load image'));
        };

        img.src = url;
    });
}
