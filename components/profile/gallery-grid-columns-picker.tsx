import { GridLayoutMenu } from '@/components/ui/grid-layout-menu';
import type { GalleryGridColumns } from '@/lib/detections/galleryGridColumns';

type Props = {
  value: GalleryGridColumns;
  onChange: (columns: GalleryGridColumns) => void;
  mutedColor: string;
  borderColor: string;
};

/** Gallery section grid size control (shared {@link GridLayoutMenu}). */
export function GalleryGridColumnsPicker(props: Props) {
  return <GridLayoutMenu {...props} context="gallery" />;
}
