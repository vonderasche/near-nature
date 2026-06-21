import { useCallback, useEffect, useMemo, useState } from 'react';

import type { DetectionGalleryItem } from '@/types';
import { userFacingErr, type UserFacingResult } from '@/types/user-facing-result';

type UseGalleryItemActionsOptions = {
  items: DetectionGalleryItem[];
  deletable?: boolean;
  onDeleteItem?: (item: DetectionGalleryItem) => Promise<UserFacingResult>;
  deletingId?: string | null;
  onOpenDetection?: (item: DetectionGalleryItem) => void;
};

export function useGalleryItemActions({
  items,
  deletable = false,
  onDeleteItem,
  deletingId = null,
  onOpenDetection,
}: UseGalleryItemActionsOptions) {
  const [selected, setSelected] = useState<DetectionGalleryItem | null>(null);
  const [pendingDelete, setPendingDelete] = useState<DetectionGalleryItem | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    if (!deletable || !onDeleteItem) {
      setPendingDelete(null);
      setDeleteError(null);
      setDeleteLoading(false);
    }
  }, [deletable, onDeleteItem]);

  const itemsById = useMemo(() => new Map(items.map((item) => [item.id, item])), [items]);

  const requestDelete = useCallback(
    async (item: DetectionGalleryItem): Promise<UserFacingResult> => {
      if (!onDeleteItem) return userFacingErr('Delete is not available.');
      const result = await onDeleteItem(item);
      if (result.ok) setSelected(null);
      return result;
    },
    [onDeleteItem],
  );

  const confirmDelete = useCallback(async () => {
    if (!pendingDelete) return;
    setDeleteLoading(true);
    try {
      const result = await requestDelete(pendingDelete);
      if (!result.ok) {
        setDeleteError(result.message);
      }
      setPendingDelete(null);
    } finally {
      setDeleteLoading(false);
    }
  }, [pendingDelete, requestDelete]);

  const handlePressItemId = useCallback(
    (itemId: string) => {
      const item = itemsById.get(itemId);
      if (!item) return;
      if (onOpenDetection) {
        onOpenDetection(item);
        return;
      }
      setSelected(item);
    },
    [itemsById, onOpenDetection],
  );

  const handleLongPressItemId = useCallback(
    (itemId: string) => {
      if (!onDeleteItem) return;
      const item = itemsById.get(itemId);
      if (item) setPendingDelete(item);
    },
    [itemsById, onDeleteItem],
  );

  const closeDetail = useCallback(() => setSelected(null), []);

  const useModalDetail = !onOpenDetection;
  const detailVisible = useModalDetail && selected !== null;

  return {
    handlePressItemId,
    handleLongPressItemId,
    closeDetail,
    detailVisible,
    selected,
    requestDelete,
    deleteConfirm: {
      visible: pendingDelete !== null,
      onCancel: () => setPendingDelete(null),
      onConfirm: confirmDelete,
      loading: deleteLoading || Boolean(pendingDelete && deletingId === pendingDelete.id),
    },
    deleteError: {
      visible: deleteError !== null,
      message: deleteError ?? '',
      onDismiss: () => setDeleteError(null),
    },
    detailModal: {
      visible: detailVisible,
      item: selected,
      deletable: Boolean(deletable && onDeleteItem),
      onRequestDelete: deletable && onDeleteItem ? requestDelete : undefined,
      deleteBusy: Boolean(selected && deletingId === selected.id),
    },
  };
}
