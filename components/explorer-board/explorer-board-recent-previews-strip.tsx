import { Image } from 'expo-image';
import { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';

import { authColors, authSpacing } from '@/constants/auth-theme';

const PREVIEW_SIZE = 44;
const MAX_PREVIEWS = 3;

type Props = {
  storedUrls: string[];
  /** Resolved URLs aligned with `storedUrls` (batch signing from parent). */
  displayUrls: (string | null)[];
  borderColor: string;
};

/**
 * Up to three recent public identification thumbnails for an explorer board row.
 */
export function ExplorerBoardRecentPreviewsStrip({ storedUrls, displayUrls, borderColor }: Props) {
  const sources = useMemo(() => storedUrls.slice(0, MAX_PREVIEWS), [storedUrls]);
  const uris = useMemo(() => displayUrls.slice(0, MAX_PREVIEWS), [displayUrls]);

  if (sources.length === 0) return null;

  return (
    <View style={styles.row} accessibilityLabel="Recent identifications preview">
      {sources.map((stored, index) => {
        const uri = uris[index];
        return (
          <View
            key={`${stored}-${index}`}
            style={[styles.tile, { width: PREVIEW_SIZE, height: PREVIEW_SIZE, borderColor }]}>
            {uri ? (
              <Image source={{ uri }} style={StyleSheet.absoluteFillObject} contentFit="cover" />
            ) : (
              <View style={styles.placeholder} />
            )}
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: authSpacing.xs,
    marginTop: authSpacing.sm,
  },
  tile: {
    borderRadius: 6,
    borderWidth: 1,
    overflow: 'hidden',
    backgroundColor: authColors.fieldBackground,
  },
  placeholder: {
    flex: 1,
    backgroundColor: authColors.fieldBackground,
  },
});
