export function formatMobileNetError(error: unknown): string {
  const message = error instanceof Error ? error.message : String(error);
  const normalized = message.toLowerCase();

  if (normalized.includes('frame processors are disabled') || normalized.includes('workletcontext')) {
    return 'Live AI needs a native rebuild with frame processors enabled.';
  }

  if (normalized.includes('resize') || normalized.includes('vision-camera-resize-plugin')) {
    return 'Live AI could not prepare the camera frame. Rebuild the native app with the resize plugin.';
  }

  if (normalized.includes('tflite') || normalized.includes('tensorflow') || normalized.includes('model')) {
    return 'Live AI model could not run. Check that the bundled TFLite model matches the app build.';
  }

  return 'Live AI hit an unexpected error. Turn it off and back on, or rebuild the app if it persists.';
}
