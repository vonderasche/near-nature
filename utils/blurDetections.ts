// ─────────────────────────────────────────────────────────────
// utils/blurDetections.ts
//
// Detects whether a photo is too blurry to identify before
// sending it to the Gemini API — saving an API call.
//
// HOW IT WORKS:
//   Sharp images contain more detail → JPEG compression can't
//   reduce them as much → higher file size relative to pixel count.
//   Blurry images have little detail → compress aggressively →
//   lower file size relative to pixel count.
//
//   bytes_per_pixel = file_size / (width × height)
//
//   This is a heuristic, not pixel-level analysis. It works well
//   for the common case of motion blur or out-of-focus shots.
//   It won't catch subtly soft images but those usually identify
//   fine anyway.
//
// DEPENDENCIES:
//   Local file access via `@/lib/fs/legacyFileSystem`; `expo-image-manipulator`
// ─────────────────────────────────────────────────────────────

import { getInfoAsync } from '@/lib/fs/legacyFileSystem';
import * as ImageManipulator from 'expo-image-manipulator';

// ── Config ────────────────────────────────────────────────────

// Bytes per pixel below this value = likely blurry.
// Tune this by testing with real blurry vs sharp photos.
// Lower = more strict (rejects more). Higher = more lenient.
const BLUR_THRESHOLD_BYTES_PER_PIXEL = 0.08;

// ── Types ─────────────────────────────────────────────────────

export interface BlurCheckResult {
  isBlurry:       boolean;
  score:          number;   // bytes per pixel — higher = sharper
  width:          number;
  height:         number;
  fileSizeBytes:  number;
}

// ── Main export ───────────────────────────────────────────────

/**
 * Check whether a photo is too blurry to reliably identify.
 *
 * @param photoUri - Local file URI from expo-camera or expo-image-picker
 * @returns BlurCheckResult with isBlurry flag and raw score
 *
 * @example
 * const result = await checkImageBlur(photoUri);
 * if (result.isBlurry) {
 *   // e.g. show your app’s themed message dialog
 *   return;
 * }
 */
export async function checkImageBlur(photoUri: string): Promise<BlurCheckResult> {

  // ── Step 1: Get file size ─────────────────────────────────
  const fileInfo = await getInfoAsync(photoUri);

  if (!fileInfo.exists) {
    throw new Error(`Image file not found: ${photoUri}`);
  }

  const fileSizeBytes = fileInfo.size ?? 0;

  // ── Step 2: Get image dimensions ─────────────────────────
  // Resize to a small thumbnail first — we only need the
  // aspect ratio, not the full image. This is fast.
  const thumbnail = await ImageManipulator.manipulateAsync(
    photoUri,
    [{ resize: { width: 100 } }],   // get proportional height
    { format: ImageManipulator.SaveFormat.JPEG, compress: 1 },
  );

  // Derive actual dimensions by scaling back up
  // (thumbnail.width will be 100, use ratio to get height)
  const aspectRatio = thumbnail.height / thumbnail.width;

  // Get actual dimensions from original — manipulate with no ops
  const original = await ImageManipulator.manipulateAsync(
    photoUri,
    [],
    { format: ImageManipulator.SaveFormat.JPEG, compress: 1 },
  );

  const width  = original.width;
  const height = original.height;
  const totalPixels = width * height;

  // ── Step 3: Calculate sharpness score ────────────────────
  const score = fileSizeBytes / totalPixels;
  const isBlurry = score < BLUR_THRESHOLD_BYTES_PER_PIXEL;

  return { isBlurry, score, width, height, fileSizeBytes };
}

// ── Convenience wrapper ───────────────────────────────────────

/**
 * Simpler boolean check — use when you just need pass/fail.
 *
 * @example
 * if (await isImageTooBlurry(photoUri)) {
 *   showToast('Photo is too blurry');
 *   return;
 * }
 */
export async function isImageTooBlurry(photoUri: string): Promise<boolean> {
  try {
    const result = await checkImageBlur(photoUri);
    return result.isBlurry;
  } catch {
    // If the check fails for any reason, don't block the user
    return false;
  }
}
