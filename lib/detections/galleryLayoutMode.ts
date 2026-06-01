export const GALLERY_LAYOUT_OPTIONS = ['grid', 'list'] as const;

export type GalleryLayoutMode = (typeof GALLERY_LAYOUT_OPTIONS)[number];

export const DEFAULT_GALLERY_LAYOUT_MODE: GalleryLayoutMode = 'grid';

export const GALLERY_LAYOUT_MODE_STORAGE_KEY = '@near_nature/gallery_layout_mode';

export function parseGalleryLayoutMode(raw: string | null | undefined): GalleryLayoutMode {
  return raw === 'list' ? 'list' : DEFAULT_GALLERY_LAYOUT_MODE;
}

export function galleryLayoutAccessibilityLabel(mode: GalleryLayoutMode): string {
  return mode === 'list' ? 'List' : 'Photo grid';
}
