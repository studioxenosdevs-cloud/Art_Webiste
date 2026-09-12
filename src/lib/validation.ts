/** Shared, conservative input guards. UI validation is mirrored by DB checks. */
const CONTROL_CHARACTERS = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g;

export function sanitizeText(value: string | undefined, maxLength: number): string {
    return (value ?? '').replace(CONTROL_CHARACTERS, '').replace(/\s+/g, ' ').trim().slice(0, maxLength);
}

export function isValidEmail(value: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) && value.length <= 254;
}

export function isSafeHttpUrl(value: string): boolean {
    if (!value) return true;
    try {
        const url = new URL(value);
        return (url.protocol === 'https:' || url.protocol === 'http:') && url.href.length <= 2_048;
    } catch {
        return false;
    }
}

export function validateImageFile(file: File): string | null {
    const maxBytes = 15 * 1024 * 1024;
    if (!file.type.startsWith('image/')) return 'Please choose a valid image file.';
    if (file.size === 0 || file.size > maxBytes) return 'Images must be between 1 byte and 15 MB.';
    return null;
}
