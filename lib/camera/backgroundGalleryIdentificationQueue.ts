import type { RegionPackId } from '@/constants/regions';
import { saveIdentificationInBackground } from '@/lib/camera/saveIdentificationInBackground';
import { isOnDevicePreviewEnabled } from '@/lib/camera/tflite/isOnDevicePreviewEnabled';
import {
  completeMvpCaptureSessionAndWait,
  isMvpCaptureSessionActive,
  suspendMvpPreviewBeforeCapture,
} from '@/lib/camera/tflite/mvp/mvpTfliteMemory';
import { identifyPhotoForCapture } from '@/lib/identification/identifyPhotoForCapture';
import { devLog } from '@/lib/devLog';

export type BackgroundGalleryQueueSnapshot = {
  active: boolean;
  total: number;
  completed: number;
  failed: number;
  saved: number;
};

type QueueJob = {
  photoUris: string[];
  userId: string;
  userState: string;
  regionId: RegionPackId;
  onSaveError?: (message: string) => void;
};

const listeners = new Set<(snapshot: BackgroundGalleryQueueSnapshot) => void>();

let snapshot: BackgroundGalleryQueueSnapshot = {
  active: false,
  total: 0,
  completed: 0,
  failed: 0,
  saved: 0,
};

let processing = false;
let pendingJob: QueueJob | null = null;

function publish(next: BackgroundGalleryQueueSnapshot): void {
  snapshot = next;
  for (const listener of listeners) {
    listener(snapshot);
  }
}

export function getBackgroundGalleryQueueSnapshot(): BackgroundGalleryQueueSnapshot {
  return snapshot;
}

export function subscribeBackgroundGalleryQueue(
  listener: (state: BackgroundGalleryQueueSnapshot) => void,
): () => void {
  listeners.add(listener);
  listener(snapshot);
  return () => {
    listeners.delete(listener);
  };
}

export function enqueueBackgroundGalleryIdentification(job: QueueJob): void {
  if (job.photoUris.length === 0) return;

  pendingJob = {
    ...job,
    photoUris: [...job.photoUris],
  };

  if (!processing) {
    void drainQueue();
  }
}

async function waitForCaptureSessionIdle(): Promise<void> {
  while (isMvpCaptureSessionActive()) {
    await new Promise((resolve) => setTimeout(resolve, 200));
  }
}

async function drainQueue(): Promise<void> {
  if (processing || !pendingJob) return;

  processing = true;
  const job = pendingJob;
  pendingJob = null;

  publish({
    active: true,
    total: job.photoUris.length,
    completed: 0,
    failed: 0,
    saved: 0,
  });

  let completed = 0;
  let failed = 0;
  let saved = 0;

  try {
    await waitForCaptureSessionIdle();

    if (isOnDevicePreviewEnabled()) {
      await suspendMvpPreviewBeforeCapture();
    }

    for (const photoUri of job.photoUris) {
      try {
        const outcome = await identifyPhotoForCapture(
          photoUri,
          job.userState,
          job.regionId,
          job.userId,
        );

        if (outcome.classifications.length === 0) {
          devLog('[gallery-queue] no species', photoUri);
          completed += 1;
          publish({ active: true, total: job.photoUris.length, completed, failed, saved });
          continue;
        }

        await new Promise<void>((resolve) => {
          saveIdentificationInBackground({
            userId: job.userId,
            photoUri,
            userState: job.userState,
            species: outcome.species,
            classifications: outcome.classifications,
            wikiByLatinName: outcome.wikiByLatinName,
            onError: (message) => {
              failed += 1;
              job.onSaveError?.(message);
              resolve();
            },
            onComplete: () => {
              saved += 1;
              resolve();
            },
          });
        });

        completed += 1;
        publish({ active: true, total: job.photoUris.length, completed, failed, saved });
      } catch (error) {
        failed += 1;
        completed += 1;
        devLog('[gallery-queue] identify failed', error);
        publish({ active: true, total: job.photoUris.length, completed, failed, saved });
      }
    }
  } finally {
    if (isOnDevicePreviewEnabled()) {
      await completeMvpCaptureSessionAndWait();
    }

    processing = false;
    publish({
      active: false,
      total: job.photoUris.length,
      completed,
      failed,
      saved,
    });

    if (pendingJob) {
      void drainQueue();
    }
  }
}
