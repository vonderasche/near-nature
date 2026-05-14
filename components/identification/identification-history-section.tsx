import { ActivityIndicator, StyleSheet, Text } from 'react-native';

import { SpeciesResultCard } from '@/components/identification/species-result-card';
import { SectionLabel } from '@/components/screen/section-label';
import { authColors, authSpacing, authTypography } from '@/constants/auth-theme';
import type { Identification } from '@/types';

type Props = {
  historyLoading: boolean;
  identifications: Identification[];
};

export function IdentificationHistorySection({ historyLoading, identifications }: Props) {
  return (
    <>
      <SectionLabel label="Your identifications" spaced />
      {historyLoading ? (
        <ActivityIndicator color={authColors.textMuted} />
      ) : identifications.length === 0 ? (
        <Text style={styles.muted}>No saved identifications yet.</Text>
      ) : (
        identifications.map((row) => (
          <SpeciesResultCard
            key={row.id}
            commonName={row.species.commonName}
            latinName={row.species.latinName}
            meta={new Date(row.timestamp).toLocaleString()}
          />
        ))
      )}
    </>
  );
}

const styles = StyleSheet.create({
  muted: {
    ...authTypography.subtitle,
    color: authColors.textMuted,
    marginBottom: authSpacing.sm,
  },
});
