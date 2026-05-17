import { Pressable, StyleSheet, Text, View } from 'react-native';

import { InlineFormError } from '@/components/screen/inline-form-error';
import { authColors, authSpacing, authTypography } from '@/constants/auth-theme';

type Props = {
  message: string;
  onRetry?: () => void;
  retryLabel?: string;
};

export function ExploreErrorState({ message, onRetry, retryLabel = 'Try again' }: Props) {
  return (
    <View style={styles.wrap}>
      <InlineFormError>{message}</InlineFormError>
      {onRetry ? (
        <Pressable
          onPress={onRetry}
          accessibilityRole="button"
          accessibilityLabel={retryLabel}
          style={({ pressed }) => pressed && styles.pressed}>
          <Text style={styles.retry}>{retryLabel}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: authSpacing.sm,
  },
  retry: {
    ...authTypography.link,
    color: authColors.textMuted,
    alignSelf: 'flex-start',
  },
  pressed: {
    opacity: 0.85,
  },
});
