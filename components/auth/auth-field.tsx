import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { HeroIcon } from '@/components/ui/hero-icon';
import type { AppTheme } from '@/constants/themes';
import { useTheme } from '@/hooks/useTheme';
import { useThemedStyles } from '@/hooks/useThemedStyles';

type AuthFieldProps = {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  secureTextEntry?: boolean;
  /** When true with `secureTextEntry`, shows a show/hide control. */
  allowShowPassword?: boolean;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  keyboardType?: 'default' | 'email-address' | 'number-pad';
  autoComplete?: 'email' | 'password' | 'new-password' | 'username' | 'off';
  textContentType?: 'emailAddress' | 'password' | 'newPassword' | 'username';
  /** Shown under the input (e.g. availability check). */
  helperText?: string | null;
  helperTone?: 'muted' | 'error';
};

function createAuthFieldStyles(theme: AppTheme) {
  return StyleSheet.create({
    wrap: {
      gap: theme.spacing.xs,
    },
    label: {
      ...theme.typography.label,
      color: theme.colors.textPrimary,
    },
    inputRow: {
      position: 'relative',
      justifyContent: 'center',
    },
    input: {
      ...theme.typography.body,
      color: theme.colors.textPrimary,
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: theme.radii.field,
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: theme.spacing.sm,
      backgroundColor: 'transparent',
    },
    inputWithToggle: {
      paddingRight: theme.spacing.xl + theme.spacing.sm,
    },
    inputError: {
      borderColor: theme.colors.danger,
    },
    toggle: {
      position: 'absolute',
      right: theme.spacing.sm,
      height: '100%',
      justifyContent: 'center',
    },
    helperMuted: {
      ...theme.typography.subtitle,
      color: theme.colors.textMuted,
    },
    helperError: {
      ...theme.typography.subtitle,
      color: theme.colors.danger,
    },
  });
}

export function AuthField({
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry,
  allowShowPassword = false,
  autoCapitalize = 'none',
  keyboardType = 'default',
  autoComplete,
  textContentType,
  helperText,
  helperTone = 'muted',
}: AuthFieldProps) {
  const styles = useThemedStyles(createAuthFieldStyles);
  const { theme } = useTheme();
  const [passwordVisible, setPasswordVisible] = useState(false);
  const isPasswordField = Boolean(secureTextEntry);
  const canToggleVisibility = isPasswordField && allowShowPassword;
  const hidden = isPasswordField && !passwordVisible;

  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.inputRow}>
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={theme.colors.textMuted}
          secureTextEntry={hidden}
          autoCapitalize={autoCapitalize}
          keyboardType={keyboardType}
          autoComplete={autoComplete}
          textContentType={textContentType}
          style={[
            styles.input,
            canToggleVisibility && styles.inputWithToggle,
            helperTone === 'error' && styles.inputError,
          ]}
        />
        {canToggleVisibility ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={passwordVisible ? 'Hide password' : 'Show password'}
            onPress={() => setPasswordVisible((v) => !v)}
            style={styles.toggle}>
            <HeroIcon
              name={passwordVisible ? 'eye-slash' : 'eye'}
              size={22}
              color={theme.colors.textMuted}
            />
          </Pressable>
        ) : null}
      </View>
      {helperText ? (
        <Text style={helperTone === 'error' ? styles.helperError : styles.helperMuted}>{helperText}</Text>
      ) : null}
    </View>
  );
}
