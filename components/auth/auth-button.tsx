import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
  type AccessibilityRole,
  type AccessibilityState,
} from 'react-native';
import type { ComponentProps } from 'react';

import { authColors, authRadii, authSpacing, authTypography } from '@/constants/auth-theme';

/** All app buttons use design tokens (`authColors`, `authRadii`, …) for future theme switching. */
export type AuthButtonVariant = 'primary' | 'outline' | 'destructive';

export type AuthButtonProps = {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  variant?: AuthButtonVariant;
  testID?: string;
  /** Span parent width (stacked sheets, equal columns in a row). */
  fillParent?: boolean;
  /** Optional leading icon (e.g. delete-outline). */
  icon?: ComponentProps<typeof MaterialIcons>['name'];
  accessibilityLabel?: string;
  accessibilityRole?: AccessibilityRole;
  accessibilityState?: AccessibilityState;
};

export function AuthButton({
  title,
  onPress,
  disabled,
  loading,
  variant = 'primary',
  testID,
  fillParent = false,
  icon,
  accessibilityLabel,
  accessibilityRole = 'button',
  accessibilityState,
}: AuthButtonProps) {
  const isPrimary = variant === 'primary';
  const isDestructive = variant === 'destructive';

  const spinnerColor = isPrimary
    ? authColors.primaryOnFill
    : isDestructive
      ? authColors.danger
      : authColors.text;

  const labelStyle = isPrimary
    ? styles.titlePrimary
    : isDestructive
      ? styles.titleDestructive
      : styles.titleOutline;

  return (
    <Pressable
      testID={testID}
      accessibilityRole={accessibilityRole}
      accessibilityState={accessibilityState}
      accessibilityLabel={accessibilityLabel ?? title}
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.base,
        fillParent && styles.fillParent,
        isPrimary && styles.primary,
        variant === 'outline' && styles.outline,
        isDestructive && styles.destructive,
        (disabled || loading) && styles.disabled,
        pressed && !disabled && !loading && styles.pressed,
      ]}>
      <View style={styles.content}>
        {loading ? (
          <ActivityIndicator color={spinnerColor} />
        ) : (
          <View style={styles.labelRow}>
            {icon ? <MaterialIcons name={icon} size={22} color={spinnerColor} /> : null}
            <Text style={[styles.title, labelStyle]}>{title}</Text>
          </View>
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
  destructive: {
    backgroundColor: authColors.background,
    borderColor: authColors.danger,
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
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: authSpacing.sm,
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
  titleDestructive: {
    color: authColors.danger,
  },
});
