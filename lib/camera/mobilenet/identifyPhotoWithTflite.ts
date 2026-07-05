import { readCaptureModePreference } from '@/hooks/useIdentificationPreferences';
import { identifyPhotoWithV6Tflite } from '@/lib/camera/tflite/v6/identifyPhotoWithV6Tflite';
import { getActiveRegionForTfliteCache } from '@/lib/camera/tflite/cachedModels';
import type { TfliteIdentificationResult } from '@/types/tfliteIdentification';

/**
 * On-device identification for camera capture and gallery picks (v6 cascade).
 */
export async function identifyPhotoWithTflite(
  photoUri: string,
): Promise<TfliteIdentificationResult> {
  const regionId = getActiveRegionForTfliteCache();
  const captureMode = await readCaptureModePreference();
  return identifyPhotoWithV6Tflite(photoUri, { captureMode, regionId });
}
