import {
  isTfliteMemoryAllocationError,
  isTflitePrepareCompatibilityError,
} from '@/lib/camera/tflite/tfliteErrorUtils';

export function formatMobileNetError(error: unknown): string {
  const message = error instanceof Error ? error.message : String(error);
  const normalized = message.toLowerCase();

  if (normalized.includes('frame processors are disabled') || normalized.includes('workletcontext')) {
    return 'Live AI needs a native rebuild with frame processors enabled.';
  }

  if (normalized.includes('resize') || normalized.includes('vision-camera-resize-plugin')) {
    return 'Live AI could not prepare the camera frame. Rebuild the native app with the resize plugin.';
  }

  if (isTflitePrepareCompatibilityError(message)) {
    return (
      'Live AI preview model failed to load (float16 TFLite ops not supported on this runtime). ' +
      'Re-export scene_gate.tflite and kingdom.tflite as full float32, then rebuild the dev client (npm run android:install).'
    );
  }

  if (isTfliteMemoryAllocationError(error)) {
    return 'Live AI ran out of device memory. Turn live AI off before taking a photo, or close other apps.';
  }

  if (normalized.includes('tflite') || normalized.includes('tensorflow') || normalized.includes('model')) {
    return 'Live AI model could not run. Check that the bundled TFLite model matches the app build.';
  }

  return 'Live AI hit an unexpected error. Turn it off and back on, or rebuild the app if it persists.';
}
