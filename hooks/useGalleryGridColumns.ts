import {
  DEFAULT_GALLERY_GRID_COLUMNS,
  GALLERY_GRID_COLUMNS_STORAGE_KEY,
  type GalleryGridColumns,
  parseGalleryGridColumns,
} from '@/lib/detections/galleryGridColumns';
import { usePersistedPreference } from '@/hooks/usePersistedPreference';

export function useGalleryGridColumns() {
  const { value: columns, setValue: setColumnCount, ready } = usePersistedPreference<GalleryGridColumns>(
    GALLERY_GRID_COLUMNS_STORAGE_KEY,
    parseGalleryGridColumns,
    DEFAULT_GALLERY_GRID_COLUMNS,
  );
  return { columns, setColumnCount, ready };
}
