import type { GalleryGridColumns } from '@/lib/detections/galleryGridColumns';

export type DiscoverGridItem = {
  key: string;
  title: string;
  imageUrl?: string | null;
  onPress: () => void;
  accessibilityLabel: string;
};

export type DiscoverGridRowEntry = {
  kind: 'row';
  id: string;
  items: DiscoverGridItem[];
};

function chunkRow<T>(items: readonly T[], columnCount: number): T[][] {
  const rows: T[][] = [];
  for (let i = 0; i < items.length; i += columnCount) {
    rows.push(items.slice(i, i + columnCount) as T[]);
  }
  return rows;
}

/** Chunk discover grid tiles into FlashList rows. */
export function buildDiscoverGridRows(
  items: readonly DiscoverGridItem[],
  columnCount: GalleryGridColumns,
): DiscoverGridRowEntry[] {
  return chunkRow(items, columnCount).map((rowItems, index) => ({
    kind: 'row' as const,
    id: `discover-row-${rowItems[0]?.key ?? index}`,
    items: rowItems,
  }));
}
