import { HeroIcon } from '@/components/ui/hero-icon';
import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { authColors, authSpacing, authTypography } from '@/constants/auth-theme';

type ProfileMetaRowProps = {
  label: string;
  value: string;
  placeholder?: boolean;
  onPress?: () => void;
  accessibilityLabel: string;
};

export function ProfileMetaRow({
  label,
  value,
  placeholder = false,
  onPress,
  accessibilityLabel,
}: ProfileMetaRowProps) {
  const content = (
    <>
      <Text style={styles.label}>{label}</Text>
      <Text
        style={[styles.value, placeholder && styles.valuePlaceholder]}
        numberOfLines={2}>
        {value}
      </Text>
      {onPress ? (
        <HeroIcon name="chevron-right" size={22} color={authColors.textMuted} />
      ) : null}
    </>
  );

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}>
        {content}
      </Pressable>
    );
  }

  return <View style={styles.row}>{content}</View>;
}

type ProfileMetaCardProps = {
  children: ReactNode;
};

export function ProfileMetaCard({ children }: ProfileMetaCardProps) {
  return <View style={styles.card}>{children}</View>;
}

export function ProfileMetaDivider() {
  return <View style={styles.divider} />;
}

const styles = StyleSheet.create({
  card: {
    alignSelf: 'stretch',
    width: '100%',
    maxWidth: 420,
    borderWidth: 1,
    borderColor: authColors.border,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: authSpacing.sm,
    paddingVertical: authSpacing.sm,
    paddingHorizontal: authSpacing.md,
    minHeight: 48,
  },
  rowPressed: {
    opacity: 0.88,
    backgroundColor: authColors.fieldBackground,
  },
  label: {
    ...authTypography.label,
    color: authColors.textMuted,
    width: 88,
  },
  value: {
    ...authTypography.body,
    flex: 1,
    color: authColors.text,
    textAlign: 'right',
  },
  valuePlaceholder: {
    color: authColors.textMuted,
    fontStyle: 'italic',
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: authColors.border,
    marginHorizontal: authSpacing.md,
  },
});
