import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { authSpacing } from '@/constants/auth-theme';

type UserProfileSummaryProps = {
  firstName: string;
  lastName: string;
  email: string;
  username: string;
  motto: string | null | undefined;
  mutedColor: string;
  mottoPlaceholder?: string;
  /** When set, the motto line is tappable (e.g. own profile edit). */
  onMottoPress?: () => void;
};

export function UserProfileSummary({
  firstName,
  lastName,
  email,
  username,
  motto,
  mutedColor,
  mottoPlaceholder = 'Add a short motto — it will show up here.',
  onMottoPress,
}: UserProfileSummaryProps) {
  const mottoTrimmed = motto?.trim();
  const mottoContent = (
    <ThemedText style={[mottoTrimmed ? styles.motto : styles.mottoPlaceholder, { color: mutedColor }]}>
      {mottoTrimmed ?? mottoPlaceholder}
    </ThemedText>
  );
  return (
    <View style={styles.block}>
      <ThemedText type="defaultSemiBold" style={styles.line}>
        {firstName}
      </ThemedText>
      <ThemedText type="defaultSemiBold" style={styles.line}>
        {lastName}
      </ThemedText>
      <ThemedText style={[styles.email, { color: mutedColor }]}>{email}</ThemedText>
      <ThemedText style={[styles.username, { color: mutedColor }]}>@{username}</ThemedText>
      <View style={styles.mottoOuter}>
        {onMottoPress ? (
          <Pressable
            onPress={onMottoPress}
            accessibilityRole="button"
            accessibilityLabel="Edit motto"
            style={({ pressed }) => [styles.mottoPressable, pressed && styles.mottoPressablePressed]}>
            {mottoContent}
          </Pressable>
        ) : (
          mottoContent
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  block: {
    alignItems: 'center',
    gap: authSpacing.sm,
  },
  line: {
    textAlign: 'center',
  },
  email: {
    fontSize: 15,
    textAlign: 'center',
  },
  username: {
    fontSize: 14,
    textAlign: 'center',
  },
  mottoOuter: {
    marginTop: authSpacing.xs,
    paddingHorizontal: authSpacing.md,
    alignItems: 'center',
  },
  motto: {
    fontSize: 15,
    textAlign: 'center',
  },
  mottoPlaceholder: {
    fontSize: 15,
    fontStyle: 'italic',
    textAlign: 'center',
  },
  mottoPressable: {
    paddingVertical: authSpacing.xs,
    borderRadius: authSpacing.xs,
  },
  mottoPressablePressed: {
    opacity: 0.85,
  },
});
