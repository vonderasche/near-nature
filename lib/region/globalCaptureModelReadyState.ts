let globalCaptureModelBundleReady = false;

export function isGlobalCaptureModelBundleReady(): boolean {
  return globalCaptureModelBundleReady;
}

export function setGlobalCaptureModelBundleReadyCache(ready: boolean): void {
  globalCaptureModelBundleReady = ready;
}

export function clearGlobalCaptureModelBundleReadyCache(): void {
  globalCaptureModelBundleReady = false;
}
