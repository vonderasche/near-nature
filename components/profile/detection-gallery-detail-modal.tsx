import { useWindowDimensions } from 'react-native';

import { DetectionGalleryDetailContent } from '@/components/profile/detection-gallery-detail-content';
import { SheetModalShell } from '@/components/ui/sheet-modal-shell';
import { authSpacing } from '@/constants/auth-theme';
import type { DetectionGalleryItem } from '@/types';
import type { UserFacingResult } from '@/types/user-facing-result';

export type DetectionGalleryDetailModalProps = {
  visible: boolean;
  item: DetectionGalleryItem | null;
  onClose: () => void;
  deletable?: boolean;
  onRequestDelete?: (item: DetectionGalleryItem) => Promise<UserFacingResult>;
  deleteBusy?: boolean;
  onViewMemberProfile?: (userId: string) => void;
};

/** Sheet wrapper around {@link DetectionGalleryDetailContent} for explorer/history flows. */
export function DetectionGalleryDetailModal({
  visible,
  item,
  onClose,
  deletable = false,
  onRequestDelete,
  deleteBusy = false,
  onViewMemberProfile,
}: DetectionGalleryDetailModalProps) {
  const { height: windowHeight } = useWindowDimensions();

  if (!visible || !item) {
    return null;
  }

  const sheetMaxHeight = Math.round(windowHeight * 0.92);

  return (
    <SheetModalShell visible onRequestClose={onClose} sheetStyle={{ maxHeight: sheetMaxHeight }}>
      <DetectionGalleryDetailContent
        item={item}
        deletable={deletable}
        onRequestDelete={onRequestDelete}
        deleteBusy={deleteBusy}
        onViewMemberProfile={(userId) => {
          onViewMemberProfile?.(userId);
          onClose();
        }}
        onDone={onClose}
        doneLabel="Close"
      />
    </SheetModalShell>
  );
}
