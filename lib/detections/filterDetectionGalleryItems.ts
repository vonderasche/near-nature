import { matchesSearchInFields } from '@/lib/search/matchesSearchQuery';
import type { DetectionGalleryItem } from '@/types';

/** Matches common name, scientific (Latin) name, and saved description on gallery rows. */
export function filterDetectionGalleryItems(
  items: readonly DetectionGalleryItem[],
  query: string,
): DetectionGalleryItem[] {
  const trimmed = query.trim();
  if (!trimmed) return [...items];

  return items.filter((item) =>
    matchesSearchInFields([item.commonName, item.latinName, item.description], trimmed),
  );
}
