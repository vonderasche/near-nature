import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import {
  ProfileMetaCard,
  ProfileMetaDivider,
  ProfileMetaRow,
} from '@/components/profile/profile-meta-row';
import { authColors, authSpacing, authTypography } from '@/constants/auth-theme';
import { usStateLabel } from '@/constants/us-states';

type UserProfileSummaryProps = {
  firstName: string;
  lastName: string;
  email: string;
  username: string;
  motto: string | null | undefined;
  state: string | null | undefined;
  mottoPlaceholder?: string;
  statePlaceholder?: string;
  onMottoPress?: () => void;
  onStatePress?: () => void;
  /** Rendered between username and editable rows (e.g. stat strip). */
  statsSlot?: ReactNode;
};

function displayNameFrom(firstName: string, lastName: string, username: string): string {
  const full = [firstName, lastName].map((s) => s.trim()).filter(Boolean).join(' ');
  return full || username;
}

export function UserProfileSummary({
  firstName,
  lastName,
  email,
  username,
  motto,
  state,
  mottoPlaceholder = 'Add a short motto',
  statePlaceholder = 'Add home state',
  onMottoPress,
  onStatePress,
  statsSlot,
}: UserProfileSummaryProps) {
  const displayName = displayNameFrom(firstName, lastName, username);
  const stateTrimmed = state?.trim();
  const mottoTrimmed = motto?.trim();

  return (
    <View style={styles.block}>
      <Text style={styles.displayName}>{displayName}</Text>
      <Text style={styles.username}>{username}</Text>

      {statsSlot ? <View style={styles.statsSlot}>{statsSlot}</View> : null}

      <ProfileMetaCard>
        <ProfileMetaRow
          label="Home state"
          value={stateTrimmed ? usStateLabel(stateTrimmed) : statePlaceholder}
          placeholder={!stateTrimmed}
          onPress={onStatePress}
          accessibilityLabel="Edit home state"
        />
        <ProfileMetaDivider />
        <ProfileMetaRow
          label="Motto"
          value={mottoTrimmed ?? mottoPlaceholder}
          placeholder={!mottoTrimmed}
          onPress={onMottoPress}
          accessibilityLabel="Edit motto"
        />
      </ProfileMetaCard>

      <Text style={styles.email} numberOfLines={1}>
        {email}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  block: {
    alignSelf: 'stretch',
    width: '100%',
    maxWidth: 420,
    alignItems: 'center',
    gap: authSpacing.sm,
  },
  displayName: {
    ...authTypography.title,
    fontSize: 22,
    lineHeight: 28,
    color: authColors.text,
    textAlign: 'center',
  },
  username: {
    ...authTypography.subtitle,
    color: authColors.textMuted,
    textAlign: 'center',
  },
  statsSlot: {
    alignSelf: 'stretch',
    width: '100%',
  },
  email: {
    ...authTypography.subtitle,
    fontSize: 13,
    color: authColors.textMuted,
    textAlign: 'center',
    marginTop: authSpacing.xs,
  },
});
