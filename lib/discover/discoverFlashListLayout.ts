import { GALLERY_FLASH_LIST_DRAW_DISTANCE } from '@/lib/detections/galleryGridColumns';

export const DISCOVER_FLASH_LIST_DRAW_DISTANCE = GALLERY_FLASH_LIST_DRAW_DISTANCE;

/** Park list cards include a 3-line description under the thumb row. */
export const DISCOVER_PARK_LIST_ROW_HEIGHT = 152;

/** Species list cards (title, parks subtitle, meta — no description). */
export const DISCOVER_SPECIES_LIST_ROW_HEIGHT = 112;

const DISCOVER_GRID_TITLE_LINES = 2;
const DISCOVER_GRID_TITLE_LINE_HEIGHT = 16;

/** FlashList row height for discover grid rows (square image + 2-line title + gaps). */
export function discoverGridFlashListRowHeight(
  tileSize: number,
  tileGap: number,
  titleGap: number,
): number {
  return tileSize + titleGap + DISCOVER_GRID_TITLE_LINES * DISCOVER_GRID_TITLE_LINE_HEIGHT + tileGap;
}
