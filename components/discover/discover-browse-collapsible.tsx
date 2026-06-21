import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { DiscoverBrowseChips } from '@/components/discover/discover-browse-chips';
import { DiscoverParkSortChips } from '@/components/discover/discover-park-sort-chips';
import { DiscoverSpeciesSortChips } from '@/components/discover/discover-species-sort-chips';
import { discoverSpeciesFilterSummary } from '@/components/discover/discover-species-filter-content';
import { HeroIcon } from '@/components/ui/hero-icon';
import { useDiscoverSpeciesBrowse } from '@/context/DiscoverSpeciesBrowseContext';
import { useTheme } from '@/hooks/useTheme';
import { animateCollapsibleToggle } from '@/lib/ui/collapsibleAnimation';
import { discoverBrowseLabel, type DiscoverBrowseMode } from '@/lib/discover/discoverBrowseMode';
import { discoverParkSortLabel, type DiscoverParkSortMode } from '@/lib/parks/discoverParkSort';
import { discoverSpeciesSortLabel } from '@/lib/discover/discoverSpeciesSort';

type Props = {
  browseMode: DiscoverBrowseMode;
  onBrowseModeChange: (mode: DiscoverBrowseMode) => void;
  parkSortMode: DiscoverParkSortMode;
  onParkSortModeChange: (mode: DiscoverParkSortMode) => void;
};

function buildSummary(
  browseMode: DiscoverBrowseMode,
  parkSortMode: DiscoverParkSortMode,
  plantFilterSummary: string,
  animalFilterSummary: string,
  plantSort: string,
  animalSort: string,
): string {
  const browse = discoverBrowseLabel(browseMode);
  if (browseMode === 'parks') {
    return `${browse} · ${discoverParkSortLabel(parkSortMode)}`;
  }
  if (browseMode === 'plants') {
    const filterPart = plantFilterSummary === 'All categories' ? null : plantFilterSummary;
    return [browse, filterPart, plantSort].filter(Boolean).join(' · ');
  }
  const filterPart = animalFilterSummary === 'All categories' ? null : animalFilterSummary;
  return [browse, filterPart, animalSort].filter(Boolean).join(' · ');
}

export function DiscoverBrowseCollapsible({
  browseMode,
  onBrowseModeChange,
  parkSortMode,
  onParkSortModeChange,
}: Props) {
  const { theme } = useTheme();
  const [expanded, setExpanded] = useState(false);
  const { getFilter, getSort, setSort } = useDiscoverSpeciesBrowse();

  const summary = useMemo(
    () =>
      buildSummary(
        browseMode,
        parkSortMode,
        discoverSpeciesFilterSummary(getFilter('plant')),
        discoverSpeciesFilterSummary(getFilter('animal')),
        discoverSpeciesSortLabel(getSort('plant')),
        discoverSpeciesSortLabel(getSort('animal')),
      ),
    [browseMode, getFilter, getSort, parkSortMode],
  );

  const toggleExpanded = () => {
    animateCollapsibleToggle();
    setExpanded((open) => !open);
  };

  return (
    <View style={[styles.wrap, { gap: theme.spacing.sm, marginBottom: theme.spacing.sm }]}>
      <Pressable
        onPress={toggleExpanded}
        accessibilityRole="button"
        accessibilityState={{ expanded }}
        accessibilityLabel={expanded ? 'Hide browse and sort options' : 'Show browse and sort options'}
        accessibilityHint={summary}
        style={({ pressed }) => [
          styles.trigger,
          {
            gap: theme.spacing.sm,
            paddingVertical: theme.spacing.sm,
            paddingHorizontal: theme.spacing.xs,
          },
          pressed && styles.triggerPressed,
        ]}>
        <View style={styles.triggerText}>
          <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Browse & sort</Text>
          <Text style={[styles.summary, { color: theme.colors.textPrimary }]} numberOfLines={2}>
            {summary}
          </Text>
        </View>
        <View style={expanded ? styles.chevronExpanded : undefined}>
          <HeroIcon name="chevron-down" size={20} color={theme.colors.textSecondary} />
        </View>
      </Pressable>

      {expanded ? (
        <View style={[styles.panel, { gap: theme.spacing.xs, paddingBottom: theme.spacing.xs }]}>
          <DiscoverBrowseChips value={browseMode} onChange={onBrowseModeChange} />
          {browseMode === 'parks' ? (
            <DiscoverParkSortChips value={parkSortMode} onChange={onParkSortModeChange} />
          ) : browseMode === 'plants' ? (
            <DiscoverSpeciesSortChips
              value={getSort('plant')}
              onChange={(mode) => setSort('plant', mode)}
            />
          ) : (
            <DiscoverSpeciesSortChips
              value={getSort('animal')}
              onChange={(mode) => setSort('animal', mode)}
            />
          )}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {},
  trigger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  triggerPressed: {
    opacity: 0.88,
  },
  triggerText: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
  },
  summary: {
    fontSize: 16,
    fontWeight: '400',
  },
  chevronExpanded: {
    transform: [{ rotate: '180deg' }],
  },
  panel: {},
});
