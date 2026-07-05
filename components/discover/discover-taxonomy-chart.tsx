import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { HeroIcon } from '@/components/ui/hero-icon';
import { Text } from '@/components/ui/Text';
import {
  TAXONOMY_CHART_EXAMPLE,
  TAXONOMY_RANKS,
  taxonomyRankSummary,
} from '@/constants/taxonomy-ranks';
import { useTheme } from '@/hooks/useTheme';
import { animateCollapsibleToggle } from '@/lib/ui/collapsibleAnimation';

export function DiscoverTaxonomyChart() {
  const { theme } = useTheme();
  const [expanded, setExpanded] = useState(false);

  const styles = useMemo(
    () =>
      StyleSheet.create({
        wrap: {
          gap: theme.spacing.sm,
          marginBottom: theme.spacing.sm,
        },
        trigger: {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: theme.spacing.sm,
          paddingVertical: theme.spacing.sm,
          paddingHorizontal: theme.spacing.xs,
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
          color: theme.colors.textSecondary,
        },
        summary: {
          fontSize: 16,
          fontWeight: '400',
          color: theme.colors.textPrimary,
        },
        chevronExpanded: {
          transform: [{ rotate: '180deg' }],
        },
        panel: {
          gap: theme.spacing.md,
          paddingHorizontal: theme.spacing.xs,
          paddingBottom: theme.spacing.xs,
        },
        intro: {
          gap: theme.spacing.xs,
        },
        introBody: {
          color: theme.colors.textSecondary,
          lineHeight: 20,
        },
        exampleBadge: {
          alignSelf: 'flex-start',
          paddingVertical: theme.spacing.xs,
          paddingHorizontal: theme.spacing.sm,
          borderRadius: theme.radii.md,
          backgroundColor: theme.colors.surfaceRaised,
        },
        ladder: {
          gap: 0,
        },
        row: {
          flexDirection: 'row',
          gap: theme.spacing.sm,
        },
        rail: {
          width: 20,
          alignItems: 'center',
        },
        dot: {
          width: 10,
          height: 10,
          borderRadius: 5,
          backgroundColor: theme.colors.accent,
          marginTop: 4,
        },
        stem: {
          flex: 1,
          width: 2,
          backgroundColor: theme.colors.border,
          minHeight: theme.spacing.md,
        },
        rowBody: {
          flex: 1,
          minWidth: 0,
          gap: theme.spacing.xs,
          paddingBottom: theme.spacing.md,
        },
        rankLine: {
          flexDirection: 'row',
          flexWrap: 'wrap',
          alignItems: 'baseline',
          gap: theme.spacing.xs,
        },
        rankName: {
          fontWeight: '700',
          color: theme.colors.textPrimary,
        },
        rankExample: {
          fontWeight: '600',
          color: theme.colors.accent,
        },
        rankDescription: {
          color: theme.colors.textSecondary,
          lineHeight: 20,
        },
        footnote: {
          color: theme.colors.textSecondary,
          fontSize: 12,
          lineHeight: 18,
        },
      }),
    [theme],
  );

  const toggleExpanded = () => {
    animateCollapsibleToggle();
    setExpanded((open) => !open);
  };

  return (
    <View style={styles.wrap}>
      <Pressable
        onPress={toggleExpanded}
        accessibilityRole="button"
        accessibilityState={{ expanded }}
        accessibilityLabel={
          expanded ? 'Hide taxonomy classification chart' : 'Show taxonomy classification chart'
        }
        accessibilityHint={taxonomyRankSummary()}
        style={({ pressed }) => [styles.trigger, pressed && styles.triggerPressed]}>
        <View style={styles.triggerText}>
          <Text style={styles.label}>Classification</Text>
          <Text style={styles.summary} numberOfLines={2}>
            {expanded ? taxonomyRankSummary() : 'How species, genus, family & more fit together'}
          </Text>
        </View>
        <View style={expanded ? styles.chevronExpanded : undefined}>
          <HeroIcon name="chevron-down" size={20} color={theme.colors.textSecondary} />
        </View>
      </Pressable>

      {expanded ? (
        <View style={styles.panel}>
          <View style={styles.intro}>
            <View style={styles.exampleBadge}>
              <Text variant="label" style={{ color: theme.colors.textPrimary }}>
                Example: {TAXONOMY_CHART_EXAMPLE.commonName}
              </Text>
            </View>
            <Text variant="body" style={styles.introBody}>
              Scientists organize living things from the broadest groups down to a single species.
              Near Nature identifications usually land at genus or species level.
            </Text>
          </View>

          <View style={styles.ladder}>
            {TAXONOMY_RANKS.map((row, index) => {
              const isLast = index === TAXONOMY_RANKS.length - 1;
              return (
                <View key={row.id} style={styles.row}>
                  <View style={styles.rail}>
                    <View style={styles.dot} />
                    {!isLast ? <View style={styles.stem} /> : null}
                  </View>
                  <View style={styles.rowBody}>
                    <View style={styles.rankLine}>
                      <Text style={styles.rankName}>{row.rank}</Text>
                      <Text style={styles.rankExample}>{row.example}</Text>
                    </View>
                    <Text variant="body" style={styles.rankDescription}>
                      {row.description}
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>

          <Text style={styles.footnote}>
            Plants follow the same ranks (for example, kingdom Plantae, genus Asclepias). Each step
            narrows from many related organisms down to one species.
          </Text>
        </View>
      ) : null}
    </View>
  );
}
