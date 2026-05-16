import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { AuthButton } from '@/components/auth/auth-button';
import { authColors, authSpacing, authTypography } from '@/constants/auth-theme';

export function DiscoverMissingStatePrompt() {
  return (
    <View style={styles.wrap}>
      <Text style={styles.title}>Set your home state</Text>
      <Text style={styles.body}>
        Discover shows popular species for your state. Add a US home state on your profile to see local Animals and
        Plants lists.
      </Text>
      <AuthButton title="Go to Profile" variant="outline" fillParent onPress={() => router.push('/(tabs)/profile')} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    justifyContent: 'center',
    gap: authSpacing.md,
    paddingVertical: authSpacing.lg,
  },
  title: {
    ...authTypography.title,
    fontSize: 22,
    color: authColors.text,
    textAlign: 'center',
  },
  body: {
    ...authTypography.body,
    color: authColors.textMuted,
    textAlign: 'center',
    lineHeight: 22,
  },
});
