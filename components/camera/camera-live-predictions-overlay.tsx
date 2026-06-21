import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { cameraLivePredictionsBottomOffset } from '@/constants/camera-layout';
import { useTheme } from '@/hooks/useTheme';
import type {
  LiveClassifierModelState,
  LiveClassifierPrediction,
} from '@/lib/camera/liveClassifierTypes';

type Props = {
  enabled: boolean;
  bottomInset: number;
  modelState: LiveClassifierModelState;
  modelError: string | null;
  predictions: readonly LiveClassifierPrediction[];
};

export function CameraLivePredictionsOverlay({
  enabled,
  bottomInset,
  modelState,
  modelError,
  predictions,
}: Props) {
  const { theme } = useTheme();
  const styles = useMemo(
    () =>
      StyleSheet.create({
        wrap: {
          position: 'absolute',
          left: theme.spacing.md,
          right: theme.spacing.md,
          paddingVertical: theme.spacing.sm,
          paddingHorizontal: theme.spacing.md,
          borderRadius: 12,
          backgroundColor: theme.colors.overlayScrim,
          gap: 4,
          zIndex: 12,
          elevation: 12,
          alignItems: 'center',
        },
        label: {
          ...theme.typography.body,
          color: theme.colors.textPrimary,
          fontWeight: '700',
          fontSize: 15,
          textAlign: 'center',
          width: '100%',
        },
        meta: {
          ...theme.typography.label,
          color: theme.colors.textSecondary,
          textAlign: 'center',
          width: '100%',
        },
        error: {
          ...theme.typography.label,
          color: '#f87171',
          textAlign: 'center',
          width: '100%',
        },
      }),
    [theme],
  );

  if (!enabled) return null;

  const topPrediction = predictions[0];

  return (
    <View
      style={[styles.wrap, { bottom: cameraLivePredictionsBottomOffset(bottomInset) }]}
      pointerEvents="none">
      {modelState === 'unavailable' ? (
        <Text style={styles.error}>{modelError ?? 'Frame processors unavailable in this build.'}</Text>
      ) : null}
      {modelState === 'loading' ? <Text style={styles.meta}>Loading model...</Text> : null}
      {modelState === 'error' ? (
        <Text style={styles.error}>{modelError ?? 'Model failed to load.'}</Text>
      ) : null}
      {modelState === 'loaded' && !topPrediction ? (
        <Text style={styles.meta}>Point camera at a subject...</Text>
      ) : null}
      {topPrediction ? (
        <Text style={styles.label} numberOfLines={2}>
          {topPrediction.label}
        </Text>
      ) : null}
    </View>
  );
}
