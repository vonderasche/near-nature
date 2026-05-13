import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { authColors, authSpacing, authTypography } from '@/constants/auth-theme';

type SpeciesResultCardProps = {
  commonName: string;
  latinName: string;
  meta: string;
  children?: ReactNode;
};

export function SpeciesResultCard({ commonName, latinName, meta, children }: SpeciesResultCardProps) {
  return (
    <View style={styles.card}>
      <Text style={styles.common}>{commonName}</Text>
      <Text style={styles.latin}>{latinName}</Text>
      <Text style={styles.meta}>{meta}</Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderColor: authColors.border,
    padding: authSpacing.md,
    marginBottom: authSpacing.sm,
  },
  common: {
    ...authTypography.body,
    fontWeight: '600',
    color: authColors.text,
  },
  latin: {
    ...authTypography.subtitle,
    color: authColors.textMuted,
    fontStyle: 'italic',
  },
  meta: {
    ...authTypography.subtitle,
    color: authColors.textMuted,
    marginTop: authSpacing.xs,
  },
});
