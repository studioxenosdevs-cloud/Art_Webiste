/**
 * Uploads an image file to Cloudinary using an unsigned upload preset.
 *
 * @param file The image File to upload.
 * @returns The secure URL of the uploaded image on Cloudinary.
 */
export async function uploadToCloudinary(file: File): Promise<string> {
    const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

    if (!cloudName || !uploadPreset) {
        throw new Error(
            'Cloudinary environment variables (VITE_CLOUDINARY_CLOUD_NAME, VITE_CLOUDINARY_UPLOAD_PRESET) are not configured. Please check your .env.local file.',
        );
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', uploadPreset);

    const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
        method: 'POST',
        body: formData,
    });

    if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        const message = errorData?.error?.message || `Cloudinary upload failed with status ${res.status}`;
        throw new Error(message);
    }

    const data = await res.json();
    return data.secure_url || data.url;
}
