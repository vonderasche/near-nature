import type { BackgroundGalleryQueueSnapshot } from '@/lib/camera/backgroundGalleryIdentificationQueue';

export function backgroundGalleryQueueLabel(
  snapshot: BackgroundGalleryQueueSnapshot,
): string | null {
  if (!snapshot.active) {
    return null;
  }
  if (snapshot.completed >= snapshot.total) {
    return `Finished — saved ${snapshot.saved} of ${snapshot.total} photos`;
  }
  return `Identifying photo ${snapshot.completed + 1} of ${snapshot.total}…`;
}
