import { Link } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ScreenHeading } from '@/components/screen/screen-heading';
import { ThemedText } from '@/components/themed-text';
import { authColors, authSpacing } from '@/constants/auth-theme';
import { contentInsetsPadding } from '@/lib/screen/contentInsets';
import { routes } from '@/lib/routing/routes';

export default function ModalScreen() {
  const insets = useSafeAreaInsets();
  const edge = contentInsetsPadding(insets);

  return (
    <View style={[styles.root, edge, { paddingHorizontal: authSpacing.lg }]}>
      <ScreenHeading title="This is a modal" marginBottom={authSpacing.md} />
      <Link href={routes.tabs} dismissTo style={styles.link}>
        <ThemedText type="link">Go to home screen</ThemedText>
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: authColors.background,
    alignItems: 'center',
    justifyContent: 'center',
    gap: authSpacing.md,
  },
  link: {
    paddingVertical: authSpacing.sm,
  },
});
