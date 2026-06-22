import {
  isTfliteMemoryAllocationError,
  isTflitePrepareCompatibilityError,
} from '@/lib/camera/tflite/tfliteErrorUtils';

/** User-facing guidance when TFLite OOMs during MVP still-photo capture. */
export function formatMvpCaptureMemoryError(label: string): string {
  return (
    `TFLite ${label} failed: not enough runtime memory. ` +
    'Turn live AI off before taking a photo, close other apps, or retry after a few seconds. ' +
    'On emulators, raise RAM to 8 GB or use a physical device.'
  );
}

export function formatMvpCaptureLoadError(error: unknown, label: string): string {
  const message = error instanceof Error ? error.message : String(error);

  if (isTflitePrepareCompatibilityError(message)) {
    return (
      `TFLite ${label} failed to load (float16 ops not supported on this runtime). ` +
      'Re-export the model as full float32, then reload the app.'
    );
  }

  if (isTfliteMemoryAllocationError(error)) {
    return formatMvpCaptureMemoryError(label);
  }

  return message;
}