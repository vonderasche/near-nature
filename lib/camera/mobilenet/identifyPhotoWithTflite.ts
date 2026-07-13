import { identifyPhotoWithV18Tflite } from '@/lib/camera/tflite/v18/identifyPhotoWithV18Tflite';
import { getActiveRegionForTfliteCache } from '@/lib/camera/tflite/cachedModels';
import { readCaptureModePreference } from '@/hooks/useIdentificationPreferences';
import type { TfliteIdentificationResult } from '@/types/tfliteIdentification';

/**
 * On-device identification for camera capture and gallery picks (v18 single family model).
 */
export async function identifyPhotoWithTflite(
  photoUri: string,
): Promise<TfliteIdentificationResult> {
  const regionId = getActiveRegionForTfliteCache();
  const captureMode = await readCaptureModePreference();
  return identifyPhotoWithV18Tflite(photoUri, { captureMode, regionId });
}
