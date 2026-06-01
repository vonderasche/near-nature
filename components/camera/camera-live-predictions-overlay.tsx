import { StyleSheet, Text, View } from 'react-native';

import { cameraLivePredictionsBottomOffset } from '@/constants/camera-layout';
import { authColors, authSpacing, authTypography } from '@/constants/auth-theme';
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

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    left: authSpacing.md,
    right: authSpacing.md,
    paddingVertical: authSpacing.sm,
    paddingHorizontal: authSpacing.md,
    borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.62)',
    gap: 4,
    zIndex: 12,
    elevation: 12,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: authSpacing.sm,
  },
  label: {
    ...authTypography.body,
    flex: 1,
    color: authColors.text,
    fontWeight: '700',
    fontSize: 15,
  },
  confidence: {
    ...authTypography.label,
    color: authColors.textMuted,
    fontVariant: ['tabular-nums'],
  },
  meta: {
    ...authTypography.label,
    color: authColors.textMuted,
  },
  error: {
    ...authTypography.label,
    color: '#f87171',
  },
});
