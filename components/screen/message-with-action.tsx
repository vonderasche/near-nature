import { StyleSheet, Text, View } from 'react-native';

import { AuthButton } from '@/components/auth/auth-button';
import { ScreenCenter } from '@/components/screen/screen-center';
import { authColors, authSpacing, authTypography } from '@/constants/auth-theme';

type MessageWithActionProps = {
  message: string;
  actionLabel: string;
  onAction: () => void;
};

/**
 * Centered helper text + outline button (permission prompts, missing asset fallbacks).
 */
export function MessageWithAction({ message, actionLabel, onAction }: MessageWithActionProps) {
  return (
    <ScreenCenter>
      <View style={styles.inner}>
        <Text style={styles.message}>{message}</Text>
        <AuthButton variant="outline" title={actionLabel} onPress={onAction} />
      </View>
    </ScreenCenter>
  );
}

const styles = StyleSheet.create({
  inner: {
    gap: authSpacing.md,
    alignItems: 'center',
    width: '100%',
    maxWidth: 400,
  },
  message: {
    ...authTypography.body,
    color: authColors.text,
    textAlign: 'center',
  },
});
