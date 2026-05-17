import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { authColors, authSpacing, authTypography } from '@/constants/auth-theme';

type LoadingHintRowProps = {
  label: string;
  spinnerColor?: string;
};

export function LoadingHintRow({ label, spinnerColor = authColors.text }: LoadingHintRowProps) {
  return (
    <View style={styles.row}>
      <ActivityIndicator color={spinnerColor} />
      <Text style={styles.body}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: authSpacing.sm,
    marginBottom: authSpacing.sm,
  },
  body: {
    ...authTypography.body,
    color: authColors.text,
  },
});
