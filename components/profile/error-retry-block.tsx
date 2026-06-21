import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { useTheme } from '@/hooks/useTheme';

type ErrorRetryBlockProps = {
  message: string;
  onRetry: () => void;
  retryLabel?: string;
};

export function ErrorRetryBlock({
  message,
  onRetry,
  retryLabel = 'Try again',
}: ErrorRetryBlockProps) {
  const { theme } = useTheme();

  return (
    <View style={[styles.block, { gap: theme.spacing.sm }]}>
      <ThemedText style={styles.message}>{message}</ThemedText>
      <Pressable
        onPress={onRetry}
        style={({ pressed }) => [
          styles.retryButton,
          {
            borderColor: theme.colors.border,
            paddingVertical: theme.spacing.xs,
            paddingHorizontal: theme.spacing.sm,
          },
          pressed && styles.retryPressed,
        ]}
        accessibilityRole="button"
        accessibilityLabel={retryLabel}>
        <ThemedText type="defaultSemiBold">{retryLabel}</ThemedText>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  block: {},
  message: {
    fontSize: 15,
  },
  retryButton: {
    alignSelf: 'flex-start',
    borderRadius: 8,
    borderWidth: 1,
  },
  retryPressed: {
    opacity: 0.7,
  },
});
