import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { HeroIcon } from '@/components/ui/hero-icon';
import { authColors, authSpacing, authTypography } from '@/constants/auth-theme';
import { usStateLabel } from '@/constants/us-states';

type Props = {
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  motto: string | null | undefined;
  state: string | null | undefined;
  mottoPlaceholder?: string;
  statePlaceholder?: string;
  onMottoPress?: () => void;
  onStatePress?: () => void;
};

function formatUsername(username: string): string {
  const trimmed = username.trim();
  if (!trimmed) return 'explorer';
  return trimmed.startsWith('@') ? trimmed.slice(1) : trimmed;
}

function fullNameLine(firstName: string, lastName: string): string {
  return [firstName, lastName].map((s) => s.trim()).filter(Boolean).join(' ');
}

export function ProfileUserIdentity({
  username,
  firstName,
  lastName,
  email,
  motto,
  state,
  mottoPlaceholder = 'Add a short motto',
  statePlaceholder = 'Add home state',
  onMottoPress,
  onStatePress,
}: Props) {
  const [expanded, setExpanded] = useState(false);
  const handle = formatUsername(username);
  const fullName = fullNameLine(firstName, lastName);
  const mottoTrimmed = motto?.trim();
  const mottoIsPlaceholder = !mottoTrimmed;
  const stateTrimmed = state?.trim();
  const stateIsPlaceholder = !stateTrimmed;
  const stateDisplay = stateTrimmed ? usStateLabel(stateTrimmed) : statePlaceholder;

  return (
    <View style={styles.wrap}>
      <Pressable
        onPress={() => setExpanded((open) => !open)}
        accessibilityRole="button"
        accessibilityState={{ expanded }}
        accessibilityLabel={
          expanded
            ? `Hide profile details for ${handle}`
            : `Show profile details for ${handle}`
        }
        style={({ pressed }) => [styles.trigger, pressed && styles.triggerPressed]}>
        <Text style={styles.username}>{handle}</Text>
        <View style={expanded ? styles.chevronExpanded : undefined}>
          <HeroIcon name="chevron-down" size={20} color={authColors.textMuted} />
        </View>
      </Pressable>

      <Pressable
        onPress={onMottoPress}
        disabled={!onMottoPress}
        accessibilityRole={onMottoPress ? 'button' : 'text'}
        accessibilityLabel="Edit motto"
        style={({ pressed }) => [
          styles.mottoPress,
          onMottoPress && pressed && styles.triggerPressed,
        ]}>
        <Text
          style={mottoIsPlaceholder ? styles.mottoPlaceholder : styles.motto}
          numberOfLines={3}>
          {mottoTrimmed ?? mottoPlaceholder}
        </Text>
      </Pressable>

      {expanded ? (
        <View style={styles.details}>
          {fullName ? (
            <Text style={styles.fullName} numberOfLines={1}>
              {fullName}
            </Text>
          ) : null}
          <Text style={styles.email} numberOfLines={1}>
            {email}
          </Text>
          <Pressable
            onPress={onStatePress}
            disabled={!onStatePress}
            accessibilityRole={onStatePress ? 'button' : 'text'}
            accessibilityLabel="Edit home state"
            style={({ pressed }) => [
              styles.statePress,
              onStatePress && pressed && styles.triggerPressed,
            ]}>
            <Text style={styles.stateLabel}>Home state</Text>
            <Text
              style={[styles.stateValue, stateIsPlaceholder && styles.stateValuePlaceholder]}
              numberOfLines={1}>
              {stateDisplay}
            </Text>
          </Pressable>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    gap: authSpacing.xs,
    maxWidth: 420,
    width: '100%',
  },
  trigger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: authSpacing.xs,
    paddingVertical: authSpacing.xs,
    paddingHorizontal: authSpacing.sm,
  },
  mottoPress: {
    paddingHorizontal: authSpacing.md,
    paddingBottom: authSpacing.xs,
    maxWidth: '100%',
  },
  triggerPressed: {
    opacity: 0.88,
  },
  username: {
    ...authTypography.title,
    fontSize: 20,
    lineHeight: 26,
    color: authColors.text,
    textAlign: 'center',
  },
  motto: {
    ...authTypography.body,
    textAlign: 'center',
    lineHeight: 22,
    color: authColors.text,
  },
  mottoPlaceholder: {
    ...authTypography.subtitle,
    fontStyle: 'italic',
    textAlign: 'center',
    lineHeight: 22,
    color: authColors.textMuted,
  },
  details: {
    alignItems: 'center',
    gap: authSpacing.xs,
    paddingHorizontal: authSpacing.md,
    paddingTop: authSpacing.xs,
  },
  statePress: {
    alignItems: 'center',
    gap: 2,
    paddingTop: authSpacing.xs,
  },
  stateLabel: {
    ...authTypography.label,
    fontSize: 12,
    textAlign: 'center',
    color: authColors.textMuted,
  },
  stateValue: {
    ...authTypography.body,
    textAlign: 'center',
    color: authColors.text,
  },
  stateValuePlaceholder: {
    fontStyle: 'italic',
    color: authColors.textMuted,
  },
  fullName: {
    ...authTypography.body,
    color: authColors.text,
    textAlign: 'center',
  },
  email: {
    ...authTypography.subtitle,
    fontSize: 13,
    textAlign: 'center',
    color: authColors.textMuted,
  },
  chevronExpanded: {
    transform: [{ rotate: '180deg' }],
  },
});
