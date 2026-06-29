let userOptIn = false;
let includeThumbnails = false;

/** Build flag: telemetry SQL + RPCs are bundled; Settings toggle is shown when true. */
export function isClassificationDebugFeatureAvailable(): boolean {
  return process.env.EXPO_PUBLIC_CLASSIFICATION_DEBUG === '1';
}

export function setClassificationDebugUserOptIn(value: boolean): void {
  userOptIn = value;
}

export function setClassificationDebugIncludeThumbnails(value: boolean): void {
  includeThumbnails = value;
}

export function isClassificationDebugUserOptIn(): boolean {
  return userOptIn;
}

export function isClassificationDebugThumbnailsEnabled(): boolean {
  return includeThumbnails;
}

/** Telemetry is sent only when the build allows it and the user opted in. */
export function isClassificationDebugEnabled(): boolean {
  return isClassificationDebugFeatureAvailable() && userOptIn;
}
