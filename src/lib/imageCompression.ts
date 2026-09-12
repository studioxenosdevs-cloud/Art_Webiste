/**
 * Compresses a browser File using an offscreen <canvas> when the file
 * size exceeds `thresholdBytes` (default 5 MB).
 *
 * - Files **below** the threshold are returned as-is (zero cost).
 * - Files **at or above** the threshold are rendered to a canvas and
 *   re-exported as JPEG, stepping quality down until the resulting
 *   blob is under `targetBytes` (default 2 MB) or quality hits the
 *   floor of 0.40.
 *
 * @param file            The image File from a file-input element.
 * @param thresholdBytes  Byte size above which compression is applied. Default: 5 MB.
 * @param targetBytes     Maximum desired output size in bytes. Default: 2 MB.
 * @returns               A Promise that resolves to the (possibly compressed) File.
 */
export async function compressImageIfNeeded(
    file: File,
    thresholdBytes = 5 * 1024 * 1024,
    targetBytes = 2 * 1024 * 1024,
): Promise<File> {
    if (file.size < thresholdBytes) {
        return file;
    }

    const bitmap = await createImageBitmap(file);
    const canvas = document.createElement('canvas');
    canvas.width = bitmap.width;
    canvas.height = bitmap.height;

    const ctx = canvas.getContext('2d');
    if (!ctx) {
        // Canvas unavailable — skip compression and return original
        bitmap.close();
        return file;
    }

    ctx.drawImage(bitmap, 0, 0);
    bitmap.close();

    let quality = 0.85;
    const QUALITY_FLOOR = 0.4;
    const QUALITY_STEP = 0.1;

    let blob: Blob | null = null;

    // Step quality down until we're under targetBytes or hit the floor
    while (quality >= QUALITY_FLOOR) {
        blob = await new Promise<Blob | null>((resolve) =>
            canvas.toBlob(resolve, 'image/jpeg', quality),
        );

        if (!blob || blob.size <= targetBytes) break;
        quality -= QUALITY_STEP;
    }

    // If we couldn't compress below target (extreme image), use the last blob
    if (!blob) return file;

    const originalNameWithoutExt = file.name.replace(/\.[^/.]+$/, '');
    return new File([blob], `${originalNameWithoutExt}.jpg`, {
        type: 'image/jpeg',
        lastModified: Date.now(),
    });
}
