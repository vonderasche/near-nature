import { StyleSheet, View } from 'react-native';

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
};

export function UserProfileSummary({
  firstName,
  lastName,
  email,
  username,
  motto,
  mutedColor,
  mottoPlaceholder = 'Add a short motto — it will show up here.',
}: UserProfileSummaryProps) {
  const mottoTrimmed = motto?.trim();
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
      <ThemedText style={[mottoTrimmed ? styles.motto : styles.mottoPlaceholder, { color: mutedColor }]}>
        {mottoTrimmed ?? mottoPlaceholder}
      </ThemedText>
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
  motto: {
    fontSize: 15,
    textAlign: 'center',
    marginTop: authSpacing.xs,
    paddingHorizontal: authSpacing.md,
  },
  mottoPlaceholder: {
    fontSize: 15,
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: authSpacing.xs,
    paddingHorizontal: authSpacing.md,
  },
});
