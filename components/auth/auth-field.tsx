import { StyleSheet, Text, TextInput, View } from 'react-native';

import { authColors, authRadii, authSpacing, authTypography } from '@/constants/auth-theme';

type AuthFieldProps = {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  secureTextEntry?: boolean;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  keyboardType?: 'default' | 'email-address';
  autoComplete?: 'email' | 'password' | 'new-password' | 'username' | 'off';
  textContentType?: 'emailAddress' | 'password' | 'newPassword' | 'username';
};

export function AuthField({
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry,
  autoCapitalize = 'none',
  keyboardType = 'default',
  autoComplete,
  textContentType,
}: AuthFieldProps) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={authColors.textMuted}
        secureTextEntry={secureTextEntry}
        autoCapitalize={autoCapitalize}
        keyboardType={keyboardType}
        autoComplete={autoComplete}
        textContentType={textContentType}
        style={styles.input}
      />
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
  input: {
    ...authTypography.body,
    color: authColors.text,
    borderWidth: 1,
    borderColor: authColors.border,
    borderRadius: authRadii.field,
    paddingHorizontal: authSpacing.sm,
    paddingVertical: authSpacing.sm,
    backgroundColor: authColors.fieldBackground,
  },
});
