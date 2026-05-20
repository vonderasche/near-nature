import { splitGalleryByNativeCategory } from '@/lib/detections/galleryNativeCategory';
import type { GalleryGridColumns } from '@/lib/detections/galleryGridColumns';
import type { DetectionGalleryItem, GalleryNativeCategory } from '@/types';

export type GalleryListSectionEntry = {
  kind: 'section';
  id: string;
  category: GalleryNativeCategory;
};

export type GalleryListRowEntry = {
  kind: 'row';
  id: string;
  items: DetectionGalleryItem[];
};

export type GalleryListEntry = GalleryListSectionEntry | GalleryListRowEntry;

function chunkRow<T>(items: readonly T[], columnCount: number): T[][] {
  const rows: T[][] = [];
  for (let i = 0; i < items.length; i += columnCount) {
    rows.push(items.slice(i, i + columnCount) as T[]);
  }
  return rows;
}

/** Flatten native / non-native sections into FlashList rows (section header + tile rows). */
export function buildGalleryListEntries(
  items: readonly DetectionGalleryItem[],
  columnCount: GalleryGridColumns,
): GalleryListEntry[] {
  const { native, nonNative } = splitGalleryByNativeCategory(items);
  const out: GalleryListEntry[] = [];

  const appendSection = (sectionItems: readonly DetectionGalleryItem[], category: GalleryNativeCategory) => {
    if (sectionItems.length === 0) return;
    for (const rowItems of chunkRow(sectionItems, columnCount)) {
      out.push({
        kind: 'row',
        id: `row-${category}-${rowItems[0]?.id ?? out.length}`,
        items: rowItems,
      });
    }
  };

  appendSection(native, 'native');
  appendSection(nonNative, 'non-native');
  return out;
}
