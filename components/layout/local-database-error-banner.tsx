import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { authColors, authSpacing, authTypography } from '@/constants/auth-theme';
import { useLocalDatabaseReady } from '@/context/LocalDatabaseContext';

/** Shown when expo-sqlite init fails; caches fall back to AsyncStorage / network-only. */
export function LocalDatabaseErrorBanner() {
  const { supported, error } = useLocalDatabaseReady();
  const insets = useSafeAreaInsets();
  const [dismissed, setDismissed] = useState(false);

  if (!supported || !error || dismissed) return null;

  return (
    <View style={[styles.wrap, { paddingTop: insets.top + authSpacing.xs }]}>
      <View style={styles.banner}>
        <Text style={styles.title}>Local storage unavailable</Text>
        <Text style={styles.body}>
          Offline caches could not open. The app will load from the network; sign-in and saves still
          work.
        </Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Dismiss local storage warning"
          onPress={() => setDismissed(true)}
          style={({ pressed }) => [styles.dismiss, pressed && styles.pressed]}>
          <Text style={styles.dismissText}>Dismiss</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
  },
  banner: {
    marginHorizontal: authSpacing.md,
    padding: authSpacing.md,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ffb020',
    backgroundColor: '#1a1408',
  },
  title: {
    ...authTypography.body,
    color: '#ffb020',
    fontWeight: '600',
    marginBottom: authSpacing.xs,
  },
  body: {
    ...authTypography.subtitle,
    color: authColors.textMuted,
    lineHeight: 18,
  },
  dismiss: {
    alignSelf: 'flex-start',
    marginTop: authSpacing.sm,
    paddingVertical: authSpacing.xs,
  },
  dismissText: {
    ...authTypography.subtitle,
    color: authColors.text,
    fontWeight: '600',
  },
  pressed: {
    opacity: 0.75,
  },
});
