import { REGION_MODELS_BUCKET } from '@/lib/region/regionModelsBucket';
import { resolveSupabaseUrl } from '@/lib/supabase/resolveSupabaseUrl';

const BUCKET_SETUP_HINT =
  'Storage bucket "region-models" is missing. Run sql/storage_bucket_region_models.sql in Supabase.';

function formatStorageErrorMessage(message: string): string {
  return message.includes('Bucket not found') ? BUCKET_SETUP_HINT : message;
}

export function getRegionModelObjectPublicUrl(storagePath: string): string {
  const configuredUrl = process.env.EXPO_PUBLIC_SUPABASE_URL?.trim();
  if (!configuredUrl) {
    throw new Error('EXPO_PUBLIC_SUPABASE_URL is not set');
  }
  const base = resolveSupabaseUrl(configuredUrl).replace(/\/$/, '');
  const encodedPath = storagePath
    .split('/')
    .map((segment) => encodeURIComponent(segment))
    .join('/');
  return `${base}/storage/v1/object/public/${REGION_MODELS_BUCKET}/${encodedPath}`;
}

export type DownloadRegionModelObjectResult =
  | { ok: true; data: ArrayBuffer }
  | { ok: false; message: string };

async function readResponseBytes(response: Response): Promise<ArrayBuffer> {
  if (typeof response.arrayBuffer === 'function') {
    return response.arrayBuffer();
  }
  const text = await response.text();
  return new TextEncoder().encode(text).buffer;
}

/**
 * Download a single object from the public `region-models` bucket.
 * Uses `fetch` on the public URL — React Native Supabase `Blob` lacks `arrayBuffer()`.
 */
export async function downloadRegionModelObject(
  storagePath: string,
): Promise<DownloadRegionModelObjectResult> {
  try {
    const url = getRegionModelObjectPublicUrl(storagePath);
    const response = await fetch(url);
    if (!response.ok) {
      const message =
        response.status === 404
          ? 'not found'
          : formatStorageErrorMessage(`HTTP ${response.status}`);
      return { ok: false, message };
    }
    const data = await readResponseBytes(response);
    return { ok: true, data };
  } catch (error) {
    return {
      ok: false,
      message: formatStorageErrorMessage(error instanceof Error ? error.message : String(error)),
    };
  }
}
