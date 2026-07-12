import { readCaptureModePreference } from '@/hooks/useIdentificationPreferences';
import { identifyPhotoWithV13Tflite } from '@/lib/camera/tflite/v13/identifyPhotoWithV13Tflite';
import { getActiveRegionForTfliteCache } from '@/lib/camera/tflite/cachedModels';
import type { TfliteIdentificationResult } from '@/types/tfliteIdentification';

/**
 * On-device identification for camera capture and gallery picks (v13 global cascade).
 */
export async function identifyPhotoWithTflite(
  photoUri: string,
): Promise<TfliteIdentificationResult> {
  const regionId = getActiveRegionForTfliteCache();
  const captureMode = await readCaptureModePreference();
  return identifyPhotoWithV13Tflite(photoUri, { captureMode, regionId });
}
