import { StyleSheet, Text, View } from 'react-native';

import type { MobileNetDebugState } from '@/hooks/useMobileNetFrameProcessor';
import { authColors, authSpacing, authTypography, tint } from '@/constants/auth-theme';

type Props = {
  modelState: 'loading' | 'loaded' | 'error';
  modelError: string | null;
  debug: MobileNetDebugState | null;
};

export function MobileNetDebugOverlay({ modelState, modelError, debug }: Props) {
  return (
    <View style={styles.wrap} pointerEvents="none">
      <Text style={styles.badge}>MobileNet test</Text>
      {modelState === 'loading' ? (
        <Text style={styles.line}>Loading model…</Text>
      ) : null}
      {modelState === 'error' ? (
        <Text style={styles.lineError}>{modelError ?? 'Model failed to load'}</Text>
      ) : null}
      {debug ? (
        <>
          <Text style={styles.line} numberOfLines={2}>
            {debug.label}
          </Text>
          <Text style={styles.meta}>
            {(debug.confidence * 100).toFixed(0)}% · {debug.inferenceMs}ms · #{debug.classIndex}
          </Text>
        </>
      ) : modelState === 'loaded' ? (
        <Text style={styles.meta}>Point camera at a subject…</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    left: authSpacing.md,
    right: authSpacing.md,
    bottom: 120,
    padding: authSpacing.sm,
    borderRadius: 10,
    backgroundColor: 'rgba(0,0,0,0.55)',
    gap: 4,
  },
  badge: {
    ...authTypography.label,
    color: tint,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  line: {
    ...authTypography.body,
    color: authColors.text,
    fontWeight: '600',
  },
  lineError: {
    ...authTypography.label,
    color: '#f87171',
  },
  meta: {
    ...authTypography.label,
    color: authColors.textMuted,
  },
});
