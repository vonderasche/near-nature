import type { DetectionGalleryItem } from '@/types';

const stagedItems = new Map<string, DetectionGalleryItem>();

/** Stage a gallery row before navigating to a detail screen (same session). */
export function stageGalleryItem(item: DetectionGalleryItem): void {
  stagedItems.set(item.id, item);
}

export function getStagedGalleryItem(detectionId: string): DetectionGalleryItem | undefined {
  return stagedItems.get(detectionId);
}

export function clearStagedGalleryItem(detectionId: string): void {
  stagedItems.delete(detectionId);
}
