export const GALLERY_GRID_COLUMN_OPTIONS = [1, 2, 4, 8] as const;

export type GalleryGridColumns = (typeof GALLERY_GRID_COLUMN_OPTIONS)[number];

export const DEFAULT_GALLERY_GRID_COLUMNS: GalleryGridColumns = 2;

export const GALLERY_GRID_COLUMNS_STORAGE_KEY = '@near_nature/gallery_grid_columns';

export function isGalleryGridColumns(n: number): n is GalleryGridColumns {
  return (GALLERY_GRID_COLUMN_OPTIONS as readonly number[]).includes(n);
}

export function parseGalleryGridColumns(raw: string | null | undefined): GalleryGridColumns {
  const n = Number(raw);
  return isGalleryGridColumns(n) ? n : DEFAULT_GALLERY_GRID_COLUMNS;
}

/** Minimum square tile size so 8-column grids stay tappable on narrow phones. */
export function minGalleryTileSize(columns: GalleryGridColumns): number {
  switch (columns) {
    case 1:
      return 120;
    case 2:
      return 72;
    case 4:
      return 44;
    case 8:
      return 36;
    default:
      return 72;
  }
}

/** Short label for menus and accessibility (e.g. "2 columns"). */
export function gridLayoutAccessibilityLabel(columns: GalleryGridColumns): string {
  return columns === 1 ? '1 column' : `${columns} columns`;
}

export const GRID_LAYOUT_MENU_TITLE = 'Grid size';

/** Off-screen draw distance (dp) for nested profile gallery FlashList rows. */
export const GALLERY_FLASH_LIST_DRAW_DISTANCE = 480;

export function galleryFlashListRowHeight(tileSize: number, tileGap: number): number {
  return tileSize + tileGap;
}
