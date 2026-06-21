import { Text } from 'react-native';

import {
  SpeciesSubcategoryFilterContent,
  speciesSubcategoryFilterSummary,
} from '@/components/profile/species-subcategory-filter-content';
import { SheetModalShell, sheetModalShellStyles } from '@/components/ui/sheet-modal-shell';
import type { GalleryCategoryFilter } from '@/lib/detections/filterDetectionGalleryItems';

export { speciesSubcategoryFilterSummary };

type Props = {
  visible: boolean;
  value: GalleryCategoryFilter;
  onChange: (value: GalleryCategoryFilter) => void;
  onClose: () => void;
};

/** Legacy modal fallback when gallery filter is not routed to a screen. */
export function SpeciesSubcategoryFilterModal({ visible, value, onChange, onClose }: Props) {
  return (
    <SheetModalShell visible={visible} onRequestClose={onClose} onBackdropPress={onClose}>
      <Text style={sheetModalShellStyles.sheetTitle}>Filter by category</Text>
      <SpeciesSubcategoryFilterContent value={value} onChange={onChange} onDone={onClose} />
    </SheetModalShell>
  );
}
