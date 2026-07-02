import { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Svg, { G, Path } from 'react-native-svg';
import usaMap from '@svg-maps/usa';

import {
  REGION_PACK_IDS,
  regionLabel,
  regionPackForState,
  statesInRegion,
  type RegionPackId,
} from '@/constants/regions';
import type { UsStateCode } from '@/constants/us-states';
import { useActiveRegion } from '@/context/RegionContext';
import { useTheme } from '@/hooks/useTheme';
import { isRegionReady, regionAvailabilityBadge } from '@/lib/region/regionReadiness';
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

export function UsRegionMap({ activeRegionId, onSelectRegion }: Props) {
  const { theme } = useTheme();
  const { isLive: activeRegionLive } = useActiveRegion();
  const mapTheme = theme.map;

  const regionReady = useMemo(
    () =>
      Object.fromEntries(
        REGION_PACK_IDS.map((regionId) => [
          regionId,
          regionId === activeRegionId
            ? activeRegionLive
            : isRegionReady(regionId),
        ]),
      ) as Record<RegionPackId, boolean>,
    [activeRegionId, activeRegionLive],
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
            {((usaMap.locations as UsaMapLocation[]).filter(
              (location) => !USA_HIDDEN_STATE_IDS.has(location.id),
            )).map((location) => {
              const stateCode = svgStateIdToCode(location.id);
              const regionId = regionPackForState(stateCode);
              const selected = regionId === activeRegionId;
              const mapped = regionId != null;
              const ready = mapped ? regionReady[regionId] : false;

              const fill = mapped
                ? selected
                  ? mapTheme.stateFillSelected
                  : ready
                    ? mapTheme.stateFillReady
                    : mapTheme.stateFillPending
                : mapTheme.unmappedFill;

              return (
                <Path
                  key={location.id}
                  d={location.path}
                  fill={fill}
                  stroke={
                    mapped
                      ? selected
                        ? mapTheme.stateStrokeSelected
                        : mapTheme.stateStroke
                      : mapTheme.stateStroke
                  }
                  strokeWidth={mapped ? (selected ? 2 : 0.75) : 1}
                  strokeLinejoin="round"
                  onPress={mapped ? () => onSelectRegion(regionId) : undefined}
                  accessibilityLabel={
                    mapped
                      ? `${location.name}, ${regionLabel(regionId)}${
                          ready ? '' : ', in progress'
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
          const ready = regionReady[regionId];
          const badge = regionAvailabilityBadge(regionId, ready);
          const states = statesInRegion(regionId).join(', ');
          return (
            <Pressable
              key={regionId}
              accessibilityRole="button"
              accessibilityState={{ selected }}
              accessibilityLabel={`${regionLabel(regionId)}, states ${states}, ${badge.toLowerCase()}`}
              onPress={() => onSelectRegion(regionId)}
              style={({ pressed }) => [
                styles.legendRow,
                {
                  borderColor: selected ? mapTheme.legendBorderSelected : theme.colors.border,
                  backgroundColor: selected
                    ? mapTheme.legendBackgroundSelected
                    : theme.colors.surfaceRaised,
                  opacity: pressed ? 0.88 : 1,
                },
              ]}>
              <View
                style={[
                  styles.legendSwatch,
                  {
                    backgroundColor: ready
                      ? mapTheme.legendSwatchReady
                      : mapTheme.legendSwatchPending,
                  },
                ]}
              />
              <View style={styles.legendBody}>
                <View style={styles.legendTitleRow}>
                  <Text
                    style={[
                      styles.legendTitle,
                      {
                        color: selected
                          ? mapTheme.legendTitleSelected
                          : theme.colors.textPrimary,
                      },
                    ]}>
                    {regionLabel(regionId)}
                  </Text>
                  <Text
                    style={[
                      styles.legendBadge,
                      {
                        color: ready ? mapTheme.legendBadgeReady : theme.colors.textSecondary,
                      },
                    ]}>
                    {badge}
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
