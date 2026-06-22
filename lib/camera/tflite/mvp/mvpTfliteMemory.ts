import { waitForTfliteLoadChainIdle } from '@/lib/camera/tflite/loadBundledTfliteModel';
import { evictAllCachedTfliteModels } from '@/lib/camera/tflite/cachedModels';
import {
  releaseMvpPreviewModels,
  yieldForTfliteMemory,
} from '@/lib/camera/tflite/mvp/mvpCachedModels';

let livePreviewSuspended = false;
let captureSessionActive = false;
let captureMemoryPrepared = false;
let finishSessionPromise: Promise<void> | null = null;
let previewResumeBlockedUntil = 0;
const suspendListeners = new Set<() => void>();
const sessionListeners = new Set<() => void>();
const previewCooldownListeners = new Set<() => void>();

export function isMvpPreviewResumeBlocked(): boolean {
  return Date.now() < previewResumeBlockedUntil;
}

export function subscribeMvpPreviewResumeBlocked(listener: () => void): () => void {
  previewCooldownListeners.add(listener);
  return () => {
    previewCooldownListeners.delete(listener);
  };
}

function notifyPreviewCooldownChange(): void {
  for (const listener of previewCooldownListeners) {
    listener();
  }
}

function blockPreviewResume(ms: number): void {
  previewResumeBlockedUntil = Date.now() + ms;
  livePreviewSuspended = true;
  notifySuspendedChange();
  notifyPreviewCooldownChange();
}

export function isMvpLivePreviewSuspended(): boolean {
  return livePreviewSuspended;
}

export function isMvpCaptureSessionActive(): boolean {
  return captureSessionActive;
}

export function subscribeMvpLivePreviewSuspended(listener: () => void): () => void {
  suspendListeners.add(listener);
  return () => {
    suspendListeners.delete(listener);
  };
}

export function subscribeMvpCaptureSessionActive(listener: () => void): () => void {
  sessionListeners.add(listener);
  return () => {
    sessionListeners.delete(listener);
  };
}

function notifySuspendedChange(): void {
  for (const listener of suspendListeners) {
    listener();
  }
}

function notifySessionChange(): void {
  for (const listener of sessionListeners) {
    listener();
  }
}

async function waitForReactCommit(): Promise<void> {
  await new Promise<void>((resolve) => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => resolve());
    });
  });
}

async function waitForNativeMemoryRelease(extraMs = 250): Promise<void> {
  await yieldForTfliteMemory();
  await new Promise((resolve) => {
    setTimeout(resolve, extraMs);
  });
}

function releaseAllTfliteModelCaches(): void {
  releaseMvpPreviewModels();
  evictAllCachedTfliteModels();
}

function suspendPreviewAndEvictModels(): void {
  livePreviewSuspended = true;
  notifySuspendedChange();
  releaseAllTfliteModelCaches();
}

/**
 * Pause live AI and evict preview models before shutter — avoids peak RAM when
 * routing/specialist models load while scene_gate/kingdom are still resident.
 */
export async function suspendMvpPreviewBeforeCapture(): Promise<void> {
  if (finishSessionPromise) {
    await finishSessionPromise;
  }

  beginMvpCaptureSession();
  await waitForReactCommit();
  await waitForTfliteLoadChainIdle();
  await waitForNativeMemoryRelease(1200);
  captureMemoryPrepared = true;
}
/** Immediately pause live preview and drop cached models (sync). */
export function beginMvpCaptureSession(): void {
  if (finishSessionPromise) return;

  captureSessionActive = true;
  captureMemoryPrepared = false;
  suspendPreviewAndEvictModels();
  notifySessionChange();
}

/**
 * Tear down live-preview TFLite and wait for native RAM to settle before capture inference.
 * Keeps preview paused until {@link finishMvpCaptureSession}.
 */
export async function prepareMvpCaptureMemory(extraReleaseMs = 1400): Promise<void> {
  if (finishSessionPromise) {
    await finishSessionPromise;
  }

  if (!captureSessionActive) {
    beginMvpCaptureSession();
  } else {
    suspendPreviewAndEvictModels();
  }

  if (captureMemoryPrepared) {
    await waitForTfliteLoadChainIdle();
    return;
  }

  await waitForReactCommit();
  await waitForTfliteLoadChainIdle();
  await waitForNativeMemoryRelease(extraReleaseMs);
  captureMemoryPrepared = true;
}

/** End capture/identification — allows live preview to start again after cooldown. */
export function finishMvpCaptureSession(cooldownMs = 2000): void {
  if (finishSessionPromise) return;
  if (!captureSessionActive && !livePreviewSuspended && !isMvpPreviewResumeBlocked()) {
    return;
  }

  blockPreviewResume(cooldownMs);

  finishSessionPromise = (async () => {
    captureSessionActive = false;
    captureMemoryPrepared = false;
    releaseAllTfliteModelCaches();
    await waitForTfliteLoadChainIdle();
    await waitForNativeMemoryRelease(cooldownMs);
    if (Date.now() >= previewResumeBlockedUntil) {
      livePreviewSuspended = false;
      notifySuspendedChange();
      notifySessionChange();
      notifyPreviewCooldownChange();
    }
  })().finally(() => {
    finishSessionPromise = null;
  });
}

/** Await in-flight session teardown (e.g. before retake navigates back to camera). */
export function awaitFinishMvpCaptureSession(): Promise<void> {
  return finishSessionPromise ?? Promise.resolve();
}

/**
 * Tear down capture models and wait for native RAM to settle before returning to camera.
 * Call from Retake so preview does not reload while trunk memory is still resident.
 */
export async function completeMvpCaptureSessionAndWait(cooldownMs = 2000): Promise<void> {
  if (!captureSessionActive && !livePreviewSuspended) {
    return;
  }
  if (!finishSessionPromise) {
    finishMvpCaptureSession(cooldownMs);
  }
  await awaitFinishMvpCaptureSession();
}

/**
 * Camera index is visible again — resume the Vision Camera feed immediately.
 * Live AI may stay paused until {@link finishMvpCaptureSession} cooldown completes.
 */
export function resumeCameraHardwarePreview(): void {
  if (!captureSessionActive) {
    return;
  }
  captureSessionActive = false;
  captureMemoryPrepared = false;
  notifySessionChange();
}

/** Clear stuck session flags after fast refresh or missed unmount. */
export function ensureMvpPreviewResumableOnCameraFocus(): void {
  if (finishSessionPromise) return;
  if (isMvpPreviewResumeBlocked()) return;
  if (!captureSessionActive && !livePreviewSuspended) return;

  captureSessionActive = false;
  captureMemoryPrepared = false;
  livePreviewSuspended = false;
  notifySuspendedChange();
  notifySessionChange();
}

/** @deprecated Use {@link finishMvpCaptureSession}. */
export function resumeMvpLivePreview(): void {
  finishMvpCaptureSession();
}

export { isTfliteMemoryAllocationError } from '@/lib/camera/tflite/tfliteErrorUtils';

/** Test helper — reset session flags between unit tests. */
export function resetMvpCaptureSessionForTests(): void {
  captureSessionActive = false;
  captureMemoryPrepared = false;
  livePreviewSuspended = false;
  finishSessionPromise = null;
  previewResumeBlockedUntil = 0;
  suspendListeners.clear();
  sessionListeners.clear();
  previewCooldownListeners.clear();
}
