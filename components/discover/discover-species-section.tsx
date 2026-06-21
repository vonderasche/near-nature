import { useCallback, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { SpeciesDetailModal } from '@/components/discover/species-detail-modal';
import { SpeciesListItem } from '@/components/discover/species-list-item';
import { ErrorRetryBlock } from '@/components/profile/error-retry-block';
import { CenteredActivityIndicator } from '@/components/shared/centered-activity-indicator';
import { useListSectionSupportingStyles } from '@/components/shared/list-detail-card';
import { useTheme } from '@/hooks/useTheme';
import { isSearchQueryActive } from '@/lib/search/normalizeSearchQuery';
import type { DiscoverSpeciesEntry, DiscoverSpeciesKind } from '@/types/discover-species';

type Props = {
  entries: DiscoverSpeciesEntry[];
  totalCount: number;
  kind: DiscoverSpeciesKind;
  loading: boolean;
  error: string | null;
  searchQuery: string;
  onRetry: () => void;
};

export function DiscoverSpeciesSection({
  entries,
  totalCount,
  kind,
  loading,
  error,
  searchQuery,
  onRetry,
}: Props) {
  const { theme } = useTheme();
  const listSectionSupportingStyles = useListSectionSupportingStyles();
  const [selected, setSelected] = useState<DiscoverSpeciesEntry | null>(null);
  const searchActive = isSearchQueryActive(searchQuery);
  const kindLabel = kind === 'plant' ? 'plant' : 'animal';
  const kindLabelPlural = kind === 'plant' ? 'plants' : 'animals';

  const closeDetail = useCallback(() => {
    setSelected(null);
  }, []);

  if (loading && entries.length === 0) {
    return <CenteredActivityIndicator accessibilityLabel={`Loading featured ${kindLabelPlural}`} />;
  }

  if (error) {
    return <ErrorRetryBlock message={error} onRetry={onRetry} />;
  }

  return (
    <View style={[styles.wrap, { gap: theme.spacing.sm }]}>
      {totalCount > 0 ? (
        <Text style={[styles.resultCount, { color: theme.colors.textSecondary }]}>
          {searchActive
            ? entries.length === 1
              ? `1 ${kindLabel} matches your search`
              : `${entries.length} ${kindLabelPlural} match your search`
            : totalCount === 1
              ? `1 featured ${kindLabel}`
              : `${totalCount} featured ${kindLabelPlural}`}
        </Text>
      ) : null}

      {entries.length === 0 ? (
        <View style={listSectionSupportingStyles.centered}>
          <Text style={listSectionSupportingStyles.muted}>
            {searchActive
              ? `No ${kindLabelPlural} match your search. Try another name or park.`
              : `No featured ${kindLabelPlural} are available right now.`}
          </Text>
        </View>
      ) : (
        entries.map((entry) => (
          <SpeciesListItem key={`${entry.kind}-${entry.name}`} entry={entry} onPress={setSelected} />
        ))
      )}

      <SpeciesDetailModal visible={selected !== null} entry={selected} onClose={closeDetail} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {},
  resultCount: {
    fontSize: 14,
    fontWeight: '400',
  },
});
