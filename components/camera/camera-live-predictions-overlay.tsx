import { StyleSheet, Text, View } from 'react-native';

import { authColors, authSpacing, authTypography, tint } from '@/constants/auth-theme';
import type { MobileNetLivePrediction } from '@/hooks/useMobileNetTop16FrameProcessor';

type Props = {
  enabled: boolean;
  modelState: 'loading' | 'loaded' | 'error' | 'unavailable';
  modelError: string | null;
  predictions: readonly MobileNetLivePrediction[];
};

export function CameraLivePredictionsOverlay({
  enabled,
  modelState,
  modelError,
  predictions,
}: Props) {
  if (!enabled) return null;

  return (
    <View style={styles.wrap} pointerEvents="none">
      <Text style={styles.title}>Live model</Text>
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
      {predictions.map((prediction, index) => (
        <View key={`${prediction.classIndex}:${index}`} style={styles.row}>
          <Text style={styles.rank}>{index + 1}</Text>
          <Text style={styles.label} numberOfLines={1}>
            {prediction.label}
          </Text>
          <Text style={styles.confidence}>{Math.round(prediction.confidence * 100)}%</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    left: authSpacing.md,
    right: authSpacing.md,
    bottom: 118,
    paddingVertical: authSpacing.sm,
    paddingHorizontal: authSpacing.md,
    borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.62)',
    gap: 6,
  },
  title: {
    ...authTypography.label,
    color: tint,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: authSpacing.sm,
  },
  rank: {
    ...authTypography.label,
    width: 18,
    color: authColors.textMuted,
    textAlign: 'center',
  },
  label: {
    ...authTypography.body,
    flex: 1,
    color: authColors.text,
    fontWeight: '700',
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
