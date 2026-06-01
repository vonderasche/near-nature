import {
  DEFAULT_GALLERY_LAYOUT_MODE,
  GALLERY_LAYOUT_MODE_STORAGE_KEY,
  parseGalleryLayoutMode,
  type GalleryLayoutMode,
} from '@/lib/detections/galleryLayoutMode';
import { usePersistedPreference } from '@/hooks/usePersistedPreference';

export function useGalleryLayoutMode() {
  const { value: layoutMode, setValue: setLayoutMode, ready } = usePersistedPreference<GalleryLayoutMode>(
    GALLERY_LAYOUT_MODE_STORAGE_KEY,
    parseGalleryLayoutMode,
    DEFAULT_GALLERY_LAYOUT_MODE,
  );
  return { layoutMode, setLayoutMode, ready };
}
