import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { DiscoverBrowseChips } from '@/components/discover/discover-browse-chips';
import { DiscoverParkSortChips } from '@/components/discover/discover-park-sort-chips';
import { DiscoverSpeciesSortChips } from '@/components/discover/discover-species-sort-chips';
import { discoverSpeciesFilterSummary } from '@/components/discover/discover-species-filter-content';
import { HeroIcon } from '@/components/ui/hero-icon';
import { authColors, authSpacing, authTypography } from '@/constants/auth-theme';
import { useDiscoverSpeciesBrowse } from '@/context/DiscoverSpeciesBrowseContext';
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

  return (
    <View style={styles.wrap}>
      <Pressable
        onPress={() => setExpanded((open) => !open)}
        accessibilityRole="button"
        accessibilityState={{ expanded }}
        accessibilityLabel={expanded ? 'Hide browse and sort options' : 'Show browse and sort options'}
        accessibilityHint={summary}
        style={({ pressed }) => [styles.trigger, pressed && styles.triggerPressed]}>
        <View style={styles.triggerText}>
          <Text style={styles.label}>Browse & sort</Text>
          <Text style={styles.summary} numberOfLines={2}>
            {summary}
          </Text>
        </View>
        <View style={expanded ? styles.chevronExpanded : undefined}>
          <HeroIcon name="chevron-down" size={20} color={authColors.textMuted} />
        </View>
      </Pressable>

      {expanded ? (
        <View style={styles.panel}>
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
  wrap: {
    gap: authSpacing.sm,
    marginBottom: authSpacing.sm,
  },
  trigger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: authSpacing.sm,
    paddingVertical: authSpacing.sm,
    paddingHorizontal: authSpacing.xs,
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
    ...authTypography.label,
    fontSize: 12,
    color: authColors.textMuted,
  },
  summary: {
    ...authTypography.body,
    color: authColors.text,
  },
  chevronExpanded: {
    transform: [{ rotate: '180deg' }],
  },
  panel: {
    gap: authSpacing.xs,
    paddingBottom: authSpacing.xs,
  },
});
