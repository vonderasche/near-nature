import { StyleSheet, View } from 'react-native';

import { AuthButton } from '@/components/auth/auth-button';
import { ThemedText } from '@/components/themed-text';
import { authSpacing } from '@/constants/auth-theme';

type DangerActionBlockProps = {
  title: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  hint: string;
  hintColor: string;
};

export function DangerActionBlock({
  title,
  onPress,
  loading,
  disabled,
  hint,
  hintColor,
}: DangerActionBlockProps) {
  return (
    <View style={styles.zone}>
      <AuthButton
        title={title}
        variant="destructive"
        fillParent
        onPress={onPress}
        loading={loading}
        disabled={disabled}
      />
      <ThemedText style={[styles.hint, { color: hintColor }]}>{hint}</ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  zone: {
    marginTop: authSpacing.md,
    gap: authSpacing.sm,
    alignItems: 'stretch',
  },
  hint: {
    fontSize: 13,
    textAlign: 'center',
  },
});
