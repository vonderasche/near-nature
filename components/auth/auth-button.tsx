import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
  type AccessibilityRole,
  type AccessibilityState,
} from 'react-native';

import { HeroIcon, type HeroIconName } from '@/components/ui/hero-icon';
import type { AppTheme } from '@/constants/themes';
import { useThemedStyles } from '@/hooks/useThemedStyles';

/** All app buttons use themed tokens for appearance switching. */
export type AuthButtonVariant = 'primary' | 'outline' | 'destructive';

export type AuthButtonProps = {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  variant?: AuthButtonVariant;
  testID?: string;
  fillParent?: boolean;
  icon?: HeroIconName;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  accessibilityRole?: AccessibilityRole;
  accessibilityState?: AccessibilityState;
};

function createAuthButtonStyles(theme: AppTheme) {
  return StyleSheet.create({
    base: {
      borderRadius: theme.radii.button,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    fillParent: {
      alignSelf: 'stretch',
      width: '100%',
    },
    primary: {
      backgroundColor: theme.colors.primaryFill,
      borderColor: theme.colors.primaryFill,
    },
    outline: {
      backgroundColor: theme.colors.background,
    },
    destructive: {
      backgroundColor: theme.colors.background,
      borderColor: theme.colors.danger,
    },
    disabled: {
      opacity: 0.45,
    },
    pressed: {
      opacity: 0.85,
    },
    content: {
      paddingVertical: theme.spacing.sm,
      paddingHorizontal: theme.spacing.md,
      minHeight: 48,
      alignItems: 'center',
      justifyContent: 'center',
    },
    labelRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: theme.spacing.sm,
    },
    title: {
      ...theme.typography.body,
      fontWeight: '600',
    },
    titlePrimary: {
      color: theme.colors.primaryOnFill,
    },
    titleOutline: {
      color: theme.colors.textPrimary,
    },
    titleDestructive: {
      color: theme.colors.danger,
    },
  });
}

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
  accessibilityHint,
  accessibilityRole = 'button',
  accessibilityState,
}: AuthButtonProps) {
  const styles = useThemedStyles(createAuthButtonStyles);
  const isPrimary = variant === 'primary';
  const isDestructive = variant === 'destructive';

  const spinnerColor = isPrimary
    ? styles.titlePrimary.color
    : isDestructive
      ? styles.titleDestructive.color
      : styles.titleOutline.color;

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
      accessibilityHint={accessibilityHint}
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
            {icon ? <HeroIcon name={icon} size={22} color={spinnerColor} /> : null}
            <Text style={[styles.title, labelStyle]}>{title}</Text>
          </View>
        )}
      </View>
    </Pressable>
  );
}
