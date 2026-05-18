import { Image } from 'expo-image';
import { HeroIcon } from '@/components/ui/hero-icon';
import { useMemo } from 'react';
import { Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';

import { authColors, authSpacing, authTypography } from '@/constants/auth-theme';
import {
  minExplorerBoardTileSize,
  type ExplorerBoardColumns,
} from '@/lib/explorerBoard/explorerBoardColumns';
import {
  formatExplorerBoardAccessibilityCounts,
  formatExplorerBoardSpeciesMeta,
} from '@/lib/explorerBoard/formatExplorerBoardSpeciesCounts';
import { parseExplorerBoardMotto } from '@/lib/explorerBoard/formatExplorerBoardMotto';
import { explorerBoardMemberTileImageUrl } from '@/lib/explorerBoard/latestExplorerBoardGalleryImage';
import type { ExplorerBoardMemberRow } from '@/services/explorerBoardService';

type Props = {
  rows: ExplorerBoardMemberRow[];
  columnCount: ExplorerBoardColumns;
  borderColor: string;
  mutedColor: string;
  resolveDisplayUrl: (storedUrl: string | null | undefined) => string | null;
  onPressMember: (row: ExplorerBoardMemberRow) => void;
};

function rankLabel(row: ExplorerBoardMemberRow): string | null {
  return row.rank > 0 ? String(row.rank) : null;
}

export function ExplorerBoardMemberGrid({
  rows,
  columnCount,
  borderColor,
  mutedColor,
  resolveDisplayUrl,
  onPressMember,
}: Props) {
  const { width: windowWidth } = useWindowDimensions();
  const compact = columnCount >= 4;

  const tileSize = useMemo(() => {
    const horizontalPadding = authSpacing.lg * 2;
    const gap = authSpacing.sm;
    const inner = Math.max(0, windowWidth - horizontalPadding);
    const cols = columnCount;
    return Math.max(minExplorerBoardTileSize(cols), Math.floor((inner - gap * (cols - 1)) / cols));
  }, [windowWidth, columnCount]);

  return (
    <View style={[styles.grid, { gap: authSpacing.sm }]} accessibilityLabel="Explorer board members">
      {rows.map((row) => {
        const stored = explorerBoardMemberTileImageUrl(row);
        const uri = resolveDisplayUrl(stored);
        const motto = parseExplorerBoardMotto(row.motto);
        const rank = rankLabel(row);
        const a11yTitle = row.rank > 0 ? `Rank ${row.rank}, ${row.username}` : row.username;

        return (
          <Pressable
            key={row.userId}
            accessibilityRole="button"
            accessibilityHint="Opens this member's public profile"
            accessibilityLabel={`${a11yTitle}, ${motto ?? 'No motto'}, ${formatExplorerBoardAccessibilityCounts(row)}`}
            onPress={() => onPressMember(row)}
            style={({ pressed }) => [
              styles.tileWrap,
              { width: tileSize, opacity: pressed ? 0.92 : 1 },
            ]}>
            <View style={[styles.tile, { width: tileSize, height: tileSize, borderColor }]}>
              {uri ? (
                <Image source={{ uri }} style={StyleSheet.absoluteFillObject} contentFit="cover" transition={200} />
              ) : (
                <View style={styles.fallback}>
                  <HeroIcon name="user" size={compact ? 28 : 40} color={mutedColor} />
                </View>
              )}
              {rank ? (
                <View style={[styles.rankBadge, { borderColor }]}>
                  <Text style={styles.rankText}>{rank}</Text>
                </View>
              ) : null}
              <View style={styles.footer}>
                <Text style={styles.username} numberOfLines={1}>
                  {row.username}
                </Text>
              </View>
            </View>
            {!compact ? (
              <Text style={[styles.meta, { color: mutedColor }]} numberOfLines={columnCount === 1 ? 2 : 1}>
                {formatExplorerBoardSpeciesMeta(row)}
              </Text>
            ) : null}
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  tileWrap: {
    marginBottom: authSpacing.xs,
  },
  tile: {
    borderRadius: 0,
    borderWidth: 1,
    overflow: 'hidden',
    backgroundColor: authColors.background,
  },
  fallback: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rankBadge: {
    position: 'absolute',
    top: authSpacing.xs,
    left: authSpacing.xs,
    minWidth: 24,
    paddingHorizontal: authSpacing.xs,
    paddingVertical: 2,
    borderWidth: 1,
    backgroundColor: authColors.background,
  },
  rankText: {
    ...authTypography.label,
    fontSize: 12,
    fontWeight: '700',
    color: authColors.text,
    textAlign: 'center',
  },
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: authSpacing.xs,
    paddingVertical: authSpacing.xs,
    backgroundColor: 'rgba(0,0,0,0.55)',
  },
  username: {
    ...authTypography.body,
    fontSize: 13,
    fontWeight: '600',
    color: authColors.text,
  },
  meta: {
    ...authTypography.body,
    fontSize: 12,
    marginTop: authSpacing.xs,
  },
});
