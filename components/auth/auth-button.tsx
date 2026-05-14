import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import { authColors, authRadii, authSpacing, authTypography } from '@/constants/auth-theme';

type Variant = 'primary' | 'outline';

type AuthButtonProps = {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  variant?: Variant;
  testID?: string;
  /** Span parent width (e.g. equal columns inside a `flex: 1` wrapper). */
  fillParent?: boolean;
};

export function AuthButton({
  title,
  onPress,
  disabled,
  loading,
  variant = 'primary',
  testID,
  fillParent = false,
}: AuthButtonProps) {
  const isOutline = variant === 'outline';
  return (
    <Pressable
      testID={testID}
      accessibilityRole="button"
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.base,
        fillParent && styles.fillParent,
        isOutline ? styles.outline : styles.primary,
        (disabled || loading) && styles.disabled,
        pressed && !disabled && !loading && styles.pressed,
      ]}>
      <View style={styles.content}>
        {loading ? (
          <ActivityIndicator color={isOutline ? authColors.text : authColors.primaryOnFill} />
        ) : (
          <Text style={[styles.title, isOutline ? styles.titleOutline : styles.titlePrimary]}>
            {title}
          </Text>
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: authRadii.button,
    borderWidth: 1,
    borderColor: authColors.border,
  },
  fillParent: {
    alignSelf: 'stretch',
    width: '100%',
  },
  primary: {
    backgroundColor: authColors.primaryFill,
    borderColor: authColors.primaryFill,
  },
  outline: {
    backgroundColor: authColors.background,
  },
  disabled: {
    opacity: 0.45,
  },
  pressed: {
    opacity: 0.85,
  },
  content: {
    paddingVertical: authSpacing.sm,
    paddingHorizontal: authSpacing.md,
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    ...authTypography.body,
    fontWeight: '600',
  },
  titlePrimary: {
    color: authColors.primaryOnFill,
  },
  titleOutline: {
    color: authColors.text,
  },
});
