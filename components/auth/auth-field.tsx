import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { HeroIcon } from '@/components/ui/hero-icon';
import { authColors, authRadii, authSpacing, authTypography } from '@/constants/auth-theme';

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
          placeholderTextColor={authColors.textMuted}
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
              color={authColors.textMuted}
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

const styles = StyleSheet.create({
  wrap: {
    gap: authSpacing.xs,
  },
  label: {
    ...authTypography.label,
    color: authColors.text,
  },
  inputRow: {
    position: 'relative',
    justifyContent: 'center',
  },
  input: {
    ...authTypography.body,
    color: authColors.text,
    borderWidth: 1,
    borderColor: authColors.border,
    borderRadius: authRadii.field,
    paddingHorizontal: authSpacing.sm,
    paddingVertical: authSpacing.sm,
    backgroundColor: 'transparent',
  },
  inputWithToggle: {
    paddingRight: authSpacing.xl + authSpacing.sm,
  },
  inputError: {
    borderColor: authColors.danger,
  },
  toggle: {
    position: 'absolute',
    right: authSpacing.sm,
    height: '100%',
    justifyContent: 'center',
  },
  helperMuted: {
    ...authTypography.subtitle,
    color: authColors.textMuted,
  },
  helperError: {
    ...authTypography.subtitle,
    color: authColors.danger,
  },
});
