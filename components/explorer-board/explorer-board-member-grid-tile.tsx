import { Image } from 'expo-image';
import { HeroIcon } from '@/components/ui/hero-icon';
import { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useTheme } from '@/hooks/useTheme';
import {
  formatExplorerBoardAccessibilityCounts,
  formatExplorerBoardSpeciesMeta,
} from '@/lib/explorerBoard/formatExplorerBoardSpeciesCounts';
import { parseExplorerBoardMotto } from '@/lib/explorerBoard/formatExplorerBoardMotto';
import { explorerBoardMemberTileImageUrl } from '@/lib/explorerBoard/latestExplorerBoardGalleryImage';
import type { ExplorerBoardMemberRow } from '@/services/explorerBoardService';

type Props = {
  row: ExplorerBoardMemberRow;
  tileSize: number;
  compact: boolean;
  columnCount: number;
  resolveDisplayUrl: (storedUrl: string | null | undefined) => string | null;
  onPressMember: (row: ExplorerBoardMemberRow) => void;
};

function rankLabel(row: ExplorerBoardMemberRow): string | null {
  return row.rank > 0 ? String(row.rank) : null;
}

export function ExplorerBoardMemberGridTile({
  row,
  tileSize,
  compact,
  columnCount,
  resolveDisplayUrl,
  onPressMember,
}: Props) {
  const { theme } = useTheme();
  const styles = useMemo(
    () =>
      StyleSheet.create({
        tileWrap: {
          marginBottom: theme.spacing.xs,
        },
        tile: {
          borderRadius: 0,
          borderWidth: 1,
          borderColor: theme.colors.border,
          overflow: 'hidden',
          backgroundColor: theme.colors.background,
        },
        fallback: {
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
        },
        rankBadge: {
          position: 'absolute',
          top: theme.spacing.xs,
          left: theme.spacing.xs,
          minWidth: 24,
          paddingHorizontal: theme.spacing.xs,
          paddingVertical: 2,
          borderWidth: 1,
          borderColor: theme.colors.border,
          backgroundColor: theme.colors.background,
        },
        rankText: {
          ...theme.typography.label,
          fontSize: 12,
          fontWeight: '700',
          color: theme.colors.textPrimary,
          textAlign: 'center',
        },
        footer: {
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          paddingHorizontal: theme.spacing.xs,
          paddingVertical: theme.spacing.xs,
          backgroundColor: theme.colors.overlayScrimStrong,
        },
        username: {
          ...theme.typography.body,
          fontSize: 13,
          fontWeight: '600',
          color: theme.colors.textPrimary,
        },
        meta: {
          ...theme.typography.body,
          fontSize: 12,
          marginTop: theme.spacing.xs,
          color: theme.colors.textSecondary,
        },
      }),
    [theme],
  );

  const stored = explorerBoardMemberTileImageUrl(row);
  const uri = resolveDisplayUrl(stored);
  const motto = parseExplorerBoardMotto(row.motto);
  const rank = rankLabel(row);
  const a11yTitle = row.rank > 0 ? `Rank ${row.rank}, ${row.username}` : row.username;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityHint="Opens this member's public profile"
      accessibilityLabel={`${a11yTitle}, ${motto ?? 'No motto'}, ${formatExplorerBoardAccessibilityCounts(row)}`}
      onPress={() => onPressMember(row)}
      style={({ pressed }) => [
        styles.tileWrap,
        { width: tileSize, opacity: pressed ? 0.92 : 1 },
      ]}>
      <View style={[styles.tile, { width: tileSize, height: tileSize }]}>
        {uri ? (
          <Image source={{ uri }} style={StyleSheet.absoluteFillObject} contentFit="cover" transition={200} />
        ) : (
          <View style={styles.fallback}>
            <HeroIcon name="user" size={compact ? 28 : 40} color={theme.colors.textSecondary} />
          </View>
        )}
        {rank ? (
          <View style={styles.rankBadge}>
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
        <Text style={styles.meta} numberOfLines={columnCount === 1 ? 2 : 1}>
          {formatExplorerBoardSpeciesMeta(row)}
        </Text>
      ) : null}
    </Pressable>
  );
}
