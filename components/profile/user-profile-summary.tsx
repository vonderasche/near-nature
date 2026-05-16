import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { usStateLabel } from '@/constants/us-states';
import { authSpacing } from '@/constants/auth-theme';

type UserProfileSummaryProps = {
  firstName: string;
  lastName: string;
  email: string;
  username: string;
  motto: string | null | undefined;
  state: string | null | undefined;
  mutedColor: string;
  mottoPlaceholder?: string;
  statePlaceholder?: string;
  /** When set, the motto line is tappable (e.g. own profile edit). */
  onMottoPress?: () => void;
  /** When set, the state line is tappable (e.g. own profile edit). */
  onStatePress?: () => void;
};

export function UserProfileSummary({
  firstName,
  lastName,
  email,
  username,
  motto,
  state,
  mutedColor,
  mottoPlaceholder = 'Add a short motto — it will show up here.',
  statePlaceholder = 'Add your US home state',
  onMottoPress,
  onStatePress,
}: UserProfileSummaryProps) {
  const stateTrimmed = state?.trim();
  const stateLabel = stateTrimmed ? usStateLabel(stateTrimmed) : statePlaceholder;
  const stateContent = (
    <ThemedText
      style={[stateTrimmed ? styles.state : styles.statePlaceholder, { color: mutedColor }]}>
      {stateLabel}
    </ThemedText>
  );

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
      <ThemedText style={[styles.username, { color: mutedColor }]}>{username}</ThemedText>
      <View style={styles.metaOuter}>
        {onStatePress ? (
          <Pressable
            onPress={onStatePress}
            accessibilityRole="button"
            accessibilityLabel="Edit home state"
            style={({ pressed }) => [styles.metaPressable, pressed && styles.metaPressablePressed]}>
            {stateContent}
          </Pressable>
        ) : (
          stateContent
        )}
      </View>
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
  metaOuter: {
    paddingHorizontal: authSpacing.md,
    alignItems: 'center',
  },
  state: {
    fontSize: 15,
    textAlign: 'center',
  },
  statePlaceholder: {
    fontSize: 15,
    fontStyle: 'italic',
    textAlign: 'center',
  },
  metaPressable: {
    paddingVertical: authSpacing.xs,
    borderRadius: authSpacing.xs,
  },
  metaPressablePressed: {
    opacity: 0.85,
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
