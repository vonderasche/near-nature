import { StyleSheet, Text } from 'react-native';

import { authColors, authSpacing, authTypography } from '@/constants/auth-theme';

type InlineFormErrorProps = {
  children: string;
};

export function InlineFormError({ children }: InlineFormErrorProps) {
  return <Text style={styles.error}>{children}</Text>;
}

const styles = StyleSheet.create({
  error: {
    ...authTypography.body,
    color: authColors.danger,
    marginTop: authSpacing.sm,
    marginBottom: authSpacing.sm,
  },
});
