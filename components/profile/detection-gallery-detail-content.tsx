import { Image } from 'expo-image';
import { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { NativeStatusBadge } from '@/components/profile/native-status-badge';
import { Button } from '@/components/ui/Button';
import { ButtonStack } from '@/components/ui/button-stack';
import { Text } from '@/components/ui/Text';
import { Title } from '@/components/ui/Title';
import { ThemedConfirmModal, ThemedMessageModal } from '@/components/ui/themed-sheet-dialog';
import { useTheme } from '@/hooks/useTheme';
import { formatDetectedAt } from '@/lib/detections/formatDetectedAt';
import { formatGalleryNativeDetailHint } from '@/lib/detections/galleryNativeCategory';
import type { DetectionGalleryItem } from '@/types';
import type { UserFacingResult } from '@/types/user-facing-result';

export type DetectionGalleryDetailContentProps = {
  item: DetectionGalleryItem;
  deletable?: boolean;
  onRequestDelete?: (item: DetectionGalleryItem) => Promise<UserFacingResult>;
  deleteBusy?: boolean;
  onViewMemberProfile?: (userId: string) => void;
  onDone?: () => void;
  doneLabel?: string;
};

export function DetectionGalleryDetailContent({
  item,
  deletable = false,
  onRequestDelete,
  deleteBusy = false,
  onViewMemberProfile,
  onDone,
  doneLabel = 'Back',
}: DetectionGalleryDetailContentProps) {
  const { theme } = useTheme();
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [confirmLoading, setConfirmLoading] = useState(false);

  const nativeHint = formatGalleryNativeDetailHint(item.nativeStatus);

  const runDelete = useCallback(async () => {
    if (!onRequestDelete) return;
    setConfirmLoading(true);
    try {
      const res = await onRequestDelete(item);
      if (!res.ok) {
        setDeleteError(res.message);
        setDeleteConfirmOpen(false);
        return;
      }
      setDeleteConfirmOpen(false);
      onDone?.();
    } finally {
      setConfirmLoading(false);
    }
  }, [item, onDone, onRequestDelete]);

  return (
    <>
      <ScrollView
        contentContainerStyle={{ gap: theme.spacing.lg, paddingBottom: theme.spacing.xl }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled">
        <View
          style={[
            styles.imageFrame,
            {
              borderRadius: theme.radii.md,
              backgroundColor: theme.colors.surface,
            },
          ]}>
          <Image
            source={{ uri: item.displayUrl }}
            style={styles.imageFill}
            contentFit="contain"
            cachePolicy="memory-disk"
            transition={200}
            accessibilityLabel={`Photo of ${item.commonName}`}
          />
        </View>

        <NativeStatusBadge category={item.nativeCategory} />
        <Title style={{ fontSize: 22, textAlign: 'center' }}>{item.commonName}</Title>
        <Text variant="subtitle" color="secondary" style={styles.centeredItalic}>
          {item.latinName}
        </Text>
        {nativeHint ? (
          <Text variant="caption" color="secondary" style={styles.centered}>
            {nativeHint}
          </Text>
        ) : null}
        {item.description ? <Text variant="body">{item.description}</Text> : null}
        <Text variant="caption" color="secondary" style={styles.centered}>
          {`Saved ${formatDetectedAt(item.detectedAt)}`}
        </Text>
        {item.ownerUsername ? (
          <Text variant="caption" color="secondary" style={styles.centered}>
            {`By @${item.ownerUsername}`}
          </Text>
        ) : null}

        <ButtonStack>
          {item.ownerUserId && onViewMemberProfile ? (
            <Button
              title="View member profile"
              variant="primary"
              fillParent
              onPress={() => onViewMemberProfile(item.ownerUserId!)}
              accessibilityLabel={`View ${item.ownerUsername ?? 'member'} profile`}
            />
          ) : null}
          {deletable && onRequestDelete ? (
            <Button
              title="Delete from gallery"
              variant="outline"
              icon="trash"
              fillParent
              onPress={() => setDeleteConfirmOpen(true)}
              loading={deleteBusy}
              disabled={deleteBusy || deleteConfirmOpen}
              accessibilityLabel="Delete photo from gallery"
            />
          ) : null}
          {onDone ? (
            <Button title={doneLabel} variant="outline" fillParent onPress={onDone} disabled={deleteBusy} />
          ) : null}
        </ButtonStack>
      </ScrollView>

      <ThemedConfirmModal
        visible={deleteConfirmOpen}
        title="Delete this photo?"
        message="It will be removed from your gallery. This cannot be undone."
        confirmLabel="Delete"
        onCancel={() => setDeleteConfirmOpen(false)}
        onConfirm={runDelete}
        confirmLoading={confirmLoading || deleteBusy}
      />
      <ThemedMessageModal
        visible={deleteError !== null}
        title="Could not delete"
        message={deleteError ?? ''}
        onDismiss={() => setDeleteError(null)}
      />
    </>
  );
}

const styles = StyleSheet.create({
  imageFrame: {
    width: '100%',
    aspectRatio: 1,
    overflow: 'hidden',
  },
  imageFill: {
    width: '100%',
    height: '100%',
  },
  centered: {
    textAlign: 'center',
  },
  centeredItalic: {
    textAlign: 'center',
    fontStyle: 'italic',
  },
});
