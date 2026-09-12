import { supabase } from './supabase';
import { compressImageIfNeeded } from './imageCompression';

/**
 * Uploads an artwork image to the Supabase 'artworks' storage bucket.
 * Files under 5 MB are uploaded untouched. Files ≥ 5 MB are compressed first.
 *
 * @param file The original image file from user input
 * @returns The public URL of the uploaded image
 */
export async function uploadArtworkImage(file: File): Promise<string> {
    // Retain file checks (compress files over 5 MB, keep files under 5 MB as-is)
    const fileToUpload = await compressImageIfNeeded(file);

    const fileExt = fileToUpload.name.split('.').pop() || 'jpg';
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `${fileName}`;

    const { error: uploadError } = await supabase.storage
        .from('artworks')
        .upload(filePath, fileToUpload, {
            cacheControl: '3600',
            upsert: false,
        });

    if (uploadError) throw uploadError;

    const { data } = supabase.storage
        .from('artworks')
        .getPublicUrl(filePath);

    return data.publicUrl;
}
