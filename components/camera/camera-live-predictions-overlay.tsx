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
  /** Bumps when a new inference result arrives — keeps overlay text in sync on device. */
  revisionKey?: number;
};

export function CameraLivePredictionsOverlay({
  enabled,
  bottomInset,
  modelState,
  modelError,
  predictions,
  revisionKey = 0,
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
        row: {
          width: '100%',
          alignItems: 'center',
          gap: 2,
        },
        label: {
          ...theme.typography.body,
          color: theme.colors.textPrimary,
          fontWeight: '700',
          fontSize: 15,
          textAlign: 'center',
          width: '100%',
        },
        secondaryLabel: {
          ...theme.typography.body,
          color: theme.colors.textPrimary,
          fontWeight: '600',
          fontSize: 14,
          textAlign: 'center',
          width: '100%',
        },
        meta: {
          ...theme.typography.label,
          color: theme.colors.textSecondary,
          textAlign: 'center',
          width: '100%',
        },
        secondaryMeta: {
          ...theme.typography.label,
          color: theme.colors.textSecondary,
          fontSize: 12,
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

  const showMulti = predictions.length > 1;

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
      {modelState === 'loaded' && predictions.length === 0 ? (
        <Text style={styles.meta}>Point camera at a subject...</Text>
      ) : null}
      {modelState === 'loaded' && predictions.length > 0
        ? predictions.map((prediction, index) => {
            const isPrimary = index === 0;
            const labelStyle = isPrimary ? styles.label : styles.secondaryLabel;
            const metaStyle = isPrimary ? styles.meta : styles.secondaryMeta;
            const pct =
              prediction.detail ??
              (prediction.confidence > 0
                ? `${Math.round(Math.min(1, Math.max(0, prediction.confidence)) * 100)}%`
                : null);

            return (
              <View key={`prediction-${revisionKey}-${index}`} style={styles.row}>
                <Text style={labelStyle} numberOfLines={2}>
                  {prediction.label}
                </Text>
                {pct ? (
                  <Text style={metaStyle} numberOfLines={1}>
                    {pct}
                  </Text>
                ) : null}
                {showMulti && index < predictions.length - 1 ? (
                  <View style={{ height: theme.spacing.xs }} />
                ) : null}
              </View>
            );
          })
        : null}
    </View>
  );
}
