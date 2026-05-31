import { GridLayoutMenu } from '@/components/ui/grid-layout-menu';
import { authColors } from '@/constants/auth-theme';
import type { GalleryGridColumns } from '@/lib/detections/galleryGridColumns';

type Props = {
  value: GalleryGridColumns;
  onChange: (columns: GalleryGridColumns) => void;
};

/** Gallery section grid size control (shared {@link GridLayoutMenu}). */
export function GalleryGridColumnsPicker({ value, onChange }: Props) {
  return (
    <GridLayoutMenu
      value={value}
      onChange={onChange}
      context="gallery"
      mutedColor={authColors.textMuted}
      borderColor={authColors.border}
    />
  );
}
