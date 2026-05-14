import { Image } from 'expo-image';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';

import { AuthButton } from '@/components/auth/auth-button';
import { authColors, authSpacing, authTypography } from '@/constants/auth-theme';
import type { DetectionGalleryItem } from '@/types';

export type DetectionGalleryDetailModalProps = {
  visible: boolean;
  /** Row to show; when `null`, the modal renders nothing (keep `visible` false). */
  item: DetectionGalleryItem | null;
  onClose: () => void;
};

function formatDetectedAt(iso: string): string {
  try {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso;
    return d.toLocaleString(undefined, {
      dateStyle: 'medium',
      timeStyle: 'short',
    });
  } catch {
    return iso;
  }
}

/**
 * Full-screen overlay with a larger preview and metadata for a saved detection.
 * Reusable anywhere you have a {@link DetectionGalleryItem}.
 */
export function DetectionGalleryDetailModal({ visible, item, onClose }: DetectionGalleryDetailModalProps) {
  const { height } = useWindowDimensions();
  const imageMaxHeight = Math.round(height * 0.42);

  if (!visible || !item) {
    return null;
  }

  return (
    <Modal animationType="fade" transparent visible={visible} onRequestClose={onClose}>
      <View style={styles.root} pointerEvents="box-none">
        <Pressable style={styles.backdrop} onPress={onClose} accessibilityLabel="Dismiss" />
        <View style={styles.sheet} accessibilityViewIsModal>
          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled">
            <View style={[styles.imageFrame, { maxHeight: imageMaxHeight }]}>
              <Image
                source={{ uri: item.displayUrl }}
                style={StyleSheet.absoluteFillObject}
                contentFit="contain"
                transition={200}
                accessibilityLabel={`Photo of ${item.commonName}`}
              />
            </View>

            <Text style={styles.commonName}>{item.commonName}</Text>
            <Text style={styles.latinName}>{item.latinName}</Text>
            <Text style={styles.meta}>Saved {formatDetectedAt(item.detectedAt)}</Text>
          </ScrollView>

          <AuthButton title="Close" variant="outline" onPress={onClose} />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: authSpacing.lg,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  sheet: {
    maxWidth: 440,
    width: '100%',
    alignSelf: 'center',
    backgroundColor: authColors.background,
    borderWidth: 1,
    borderColor: authColors.border,
    padding: authSpacing.md,
    gap: authSpacing.md,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    zIndex: 1,
  },
  scroll: {
    maxHeight: '72%',
  },
  scrollContent: {
    gap: authSpacing.sm,
    paddingBottom: authSpacing.xs,
  },
  imageFrame: {
    width: '100%',
    minHeight: 160,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: authColors.fieldBackground,
    borderWidth: 1,
    borderColor: authColors.border,
  },
  commonName: {
    ...authTypography.title,
    fontSize: 22,
    color: authColors.text,
  },
  latinName: {
    ...authTypography.subtitle,
    color: authColors.textMuted,
    fontStyle: 'italic',
  },
  meta: {
    ...authTypography.subtitle,
    color: authColors.textMuted,
  },
});
