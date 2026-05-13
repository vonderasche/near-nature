import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { authSpacing } from '@/constants/auth-theme';

type ErrorRetryBlockProps = {
  message: string;
  onRetry: () => void;
  retryLabel?: string;
  borderColor: string;
};

export function ErrorRetryBlock({
  message,
  onRetry,
  retryLabel = 'Try again',
  borderColor,
}: ErrorRetryBlockProps) {
  return (
    <View style={styles.block}>
      <ThemedText style={styles.message}>{message}</ThemedText>
      <Pressable
        onPress={onRetry}
        style={({ pressed }) => [
          styles.retryButton,
          { borderColor },
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
  block: {
    gap: authSpacing.sm,
  },
  message: {
    fontSize: 15,
  },
  retryButton: {
    alignSelf: 'flex-start',
    paddingVertical: authSpacing.xs,
    paddingHorizontal: authSpacing.sm,
    borderRadius: 8,
    borderWidth: 1,
  },
  retryPressed: {
    opacity: 0.7,
  },
});
