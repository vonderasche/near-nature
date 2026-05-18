import { StyleSheet, Text, View } from 'react-native';

import { authColors, authSpacing, authTypography } from '@/constants/auth-theme';
import type { UserScoreByCategoryRow } from '@/services/scoreBreakdownService';

type Props = {
  rows: readonly UserScoreByCategoryRow[];
  totalPoints: number;
  totalDetectionPoints: number;
  totalAwardPoints: number;
  borderColor: string;
  mutedColor: string;
};

export function ScoreByCategorySummary({
  rows,
  totalPoints,
  totalDetectionPoints,
  totalAwardPoints,
  borderColor,
  mutedColor,
}: Props) {
  if (rows.length === 0) return null;

  return (
    <View style={[styles.wrap, { borderColor }]}>
      <Text style={styles.heading}>Points by discipline</Text>
      <Text style={[styles.totals, { color: mutedColor }]}>
        {totalPoints} total · {totalDetectionPoints} from identifications · {totalAwardPoints}{' '}
        from milestones
      </Text>
      {rows.map((row) => (
        <View key={row.mainCategory} style={[styles.row, { borderColor }]}>
          <View style={styles.rowLeft}>
            <Text style={styles.label}>{row.label}</Text>
            <Text style={[styles.meta, { color: mutedColor }]}>
              {row.speciesCount} species · {row.detectionPoints} id · {row.awardPoints} bonus
            </Text>
          </View>
          <Text style={styles.points}>{row.totalPoints}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    borderWidth: 1,
    borderRadius: 4,
    padding: authSpacing.sm,
    gap: authSpacing.xs,
  },
  heading: {
    ...authTypography.body,
    fontWeight: '600',
    color: authColors.text,
  },
  totals: {
    ...authTypography.subtitle,
    fontSize: 12,
    marginBottom: authSpacing.xs,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: authSpacing.sm,
    paddingVertical: authSpacing.xs,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  rowLeft: {
    flex: 1,
    gap: 2,
  },
  label: {
    ...authTypography.body,
    color: authColors.text,
  },
  meta: {
    ...authTypography.subtitle,
    fontSize: 11,
  },
  points: {
    ...authTypography.body,
    fontWeight: '700',
    color: authColors.text,
  },
});
