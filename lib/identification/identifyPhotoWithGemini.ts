import { identifySpeciesInImage } from '@/api/gemini';
import { deleteAsync, readLocalFileAsBase64 } from '@/lib/fs/legacyFileSystem';
import { filterClassifications } from '@/lib/image/imageFilters';
import { resizeImageForUpload } from '@/lib/image/resizeImageForUpload';
import type { ClassificationResult } from '@/types';

/** Cloud vision identify (Supabase Edge Function or dev Gemini API key). */
export async function identifyPhotoWithGemini(
  photoUri: string,
): Promise<ClassificationResult[]> {
  const resized = await resizeImageForUpload(photoUri, { maxEdge: 1280 });
  let resizedUri = resized.uri;

  try {
    const base64 = await readLocalFileAsBase64(resizedUri);
    const rawClassifications = await identifySpeciesInImage(base64, 'image/jpeg');
    return filterClassifications(rawClassifications).results;
  } finally {
    if (resizedUri !== photoUri) {
      await deleteAsync(resizedUri, { idempotent: true }).catch(() => {});
    }
  }
}
