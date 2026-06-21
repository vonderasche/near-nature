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
          backgroundColor: 'rgba(0,0,0,0.62)',
          gap: 4,
          zIndex: 12,
          elevation: 12,
        },
        row: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: theme.spacing.sm,
        },
        label: {
          ...theme.typography.body,
          flex: 1,
          color: theme.colors.textPrimary,
          fontWeight: '700',
          fontSize: 15,
        },
        confidence: {
          ...theme.typography.label,
          color: theme.colors.textSecondary,
          fontVariant: ['tabular-nums'],
        },
        meta: {
          ...theme.typography.label,
          color: theme.colors.textSecondary,
        },
        error: {
          ...theme.typography.label,
          color: '#f87171',
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
        <View style={styles.row}>
          <Text style={styles.label} numberOfLines={1}>
            {topPrediction.label}
          </Text>
          <Text style={styles.confidence}>{Math.round(topPrediction.confidence * 100)}%</Text>
        </View>
      ) : null}
    </View>
  );
}
