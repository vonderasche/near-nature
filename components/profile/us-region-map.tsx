import { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Svg, { G, Path } from 'react-native-svg';
import usaMap from '@svg-maps/usa';

import {
  REGION_PACK_IDS,
  isRegionLive,
  regionLabel,
  regionPackForState,
  statesInRegion,
  type RegionPackId,
} from '@/constants/regions';
import type { UsStateCode } from '@/constants/us-states';
import { useTheme } from '@/hooks/useTheme';
import {
  USA_CONUS_ASPECT_RATIO,
  USA_CONUS_VIEW_BOX_STRING,
  USA_HIDDEN_STATE_IDS,
} from '@/lib/region/usaSvgMapConfig';

type UsaMapLocation = {
  id: string;
  name: string;
  path: string;
};

type Props = {
  activeRegionId: RegionPackId;
  onSelectRegion: (regionId: RegionPackId) => void;
};

function svgStateIdToCode(id: string): UsStateCode {
  return id.toUpperCase() as UsStateCode;
}

function regionFillColor(
  regionId: RegionPackId,
  activeRegionId: RegionPackId,
  accent: string,
  muted: string,
): string {
  const selected = regionId === activeRegionId;
  const live = isRegionLive(regionId);
  if (selected) return `${accent}66`;
  if (live) return `${accent}28`;
  return `${muted}30`;
}

export function UsRegionMap({ activeRegionId, onSelectRegion }: Props) {
  const { theme } = useTheme();

  const locations = useMemo(
    () =>
      (usaMap.locations as UsaMapLocation[]).filter(
        (location) => !USA_HIDDEN_STATE_IDS.has(location.id),
      ),
    [],
  );

  return (
    <View style={styles.wrap}>
      <Text style={[styles.hint, { color: theme.colors.textSecondary }]}>
        Tap a state on the map or choose a region below.
      </Text>

      <View
        style={[
          styles.mapFrame,
          { borderColor: theme.colors.border, backgroundColor: theme.colors.background },
        ]}>
        <Svg
          width="100%"
          height="100%"
          viewBox={USA_CONUS_VIEW_BOX_STRING}
          preserveAspectRatio="xMidYMid meet"
          accessibilityRole="image"
          accessibilityLabel="Map of the United States with regional packs highlighted">
          <G>
            {locations.map((location) => {
              const stateCode = svgStateIdToCode(location.id);
              const regionId = regionPackForState(stateCode);
              const selected = regionId === activeRegionId;
              const mapped = regionId != null;

              const fill = mapped
                ? regionFillColor(
                    regionId,
                    activeRegionId,
                    theme.colors.accent,
                    theme.colors.textSecondary,
                  )
                : theme.colors.surfaceRaised;

              return (
                <Path
                  key={location.id}
                  d={location.path}
                  fill={fill}
                  stroke={
                    selected && mapped ? theme.colors.accent : theme.colors.border
                  }
                  strokeWidth={selected && mapped ? 2 : 0.75}
                  strokeLinejoin="round"
                  onPress={mapped ? () => onSelectRegion(regionId) : undefined}
                  accessibilityLabel={
                    mapped
                      ? `${location.name}, ${regionLabel(regionId)}${
                          isRegionLive(regionId) ? '' : ', coming soon'
                        }`
                      : `${location.name}, not in a regional pack yet`
                  }
                />
              );
            })}
          </G>
        </Svg>
      </View>

      <View style={styles.legend}>
        {REGION_PACK_IDS.map((regionId) => {
          const selected = regionId === activeRegionId;
          const live = isRegionLive(regionId);
          const states = statesInRegion(regionId).join(', ');
          return (
            <Pressable
              key={regionId}
              accessibilityRole="button"
              accessibilityState={{ selected }}
              accessibilityLabel={`${regionLabel(regionId)}, states ${states}${live ? '' : ', coming soon'}`}
              onPress={() => onSelectRegion(regionId)}
              style={({ pressed }) => [
                styles.legendRow,
                {
                  borderColor: selected ? theme.colors.accent : theme.colors.border,
                  backgroundColor: selected
                    ? `${theme.colors.accent}18`
                    : theme.colors.surfaceRaised,
                  opacity: pressed ? 0.88 : 1,
                },
              ]}>
              <View
                style={[
                  styles.legendSwatch,
                  {
                    backgroundColor: live ? theme.colors.accent : theme.colors.textSecondary,
                  },
                ]}
              />
              <View style={styles.legendBody}>
                <View style={styles.legendTitleRow}>
                  <Text
                    style={[
                      styles.legendTitle,
                      { color: selected ? theme.colors.accent : theme.colors.textPrimary },
                    ]}>
                    {regionLabel(regionId)}
                  </Text>
                  <Text
                    style={[
                      styles.legendBadge,
                      { color: live ? theme.colors.accent : theme.colors.textSecondary },
                    ]}>
                    {live ? 'Live' : 'Coming soon'}
                  </Text>
                </View>
                <Text style={[styles.legendStates, { color: theme.colors.textSecondary }]}>
                  {states}
                </Text>
              </View>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: '100%',
    maxWidth: 420,
    alignSelf: 'center',
    gap: 12,
  },
  hint: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
  },
  mapFrame: {
    width: '100%',
    aspectRatio: USA_CONUS_ASPECT_RATIO,
    borderWidth: 1,
    borderRadius: 12,
    overflow: 'hidden',
    padding: 8,
  },
  legend: {
    gap: 8,
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    padding: 12,
    borderWidth: 1,
    borderRadius: 10,
  },
  legendSwatch: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginTop: 5,
  },
  legendBody: {
    flex: 1,
    gap: 4,
  },
  legendTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  legendTitle: {
    fontSize: 15,
    fontWeight: '600',
  },
  legendBadge: {
    fontSize: 12,
    fontWeight: '500',
  },
  legendStates: {
    fontSize: 13,
    lineHeight: 18,
  },
});
