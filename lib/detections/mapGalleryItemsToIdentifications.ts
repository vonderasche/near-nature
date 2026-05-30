import type { DetectionGalleryItem, Identification } from '@/types';

/** Maps hydrated gallery rows to camera history `Identification` items. */
export function mapGalleryItemsToIdentifications(
  userId: string,
  items: readonly DetectionGalleryItem[],
): Identification[] {
  return items.map((item) => ({
    id: item.id,
    userId,
    timestamp: item.detectedAt,
    species: {
      id: item.id,
      latinName: item.latinName,
      commonName: item.commonName,
      taxonGroup: item.category,
      status: item.nativeStatus,
    },
    galleryItem: item,
  }));
}
