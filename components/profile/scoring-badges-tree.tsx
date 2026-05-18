import { forwardRef, useImperativeHandle, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { CenteredActivityIndicator } from '@/components/profile/centered-activity-indicator';
import { ErrorRetryBlock } from '@/components/profile/error-retry-block';
import { HeroIcon } from '@/components/ui/hero-icon';
import { authColors, authSpacing, authTypography } from '@/constants/auth-theme';
import { ScoreByCategorySummary } from '@/components/profile/score-by-category-summary';
import { useUserScoringSnapshot } from '@/hooks/useUserScoringSnapshot';
import { buildScoringTree, type ScoringTreeNode } from '@/lib/profile/buildScoringTree';

type Props = {
  userId?: string;
  borderColor: string;
  mutedColor: string;
};

export type ScoringBadgesTreeHandle = {
  refetch: () => Promise<void>;
};

function TreeNodeRow({
  node,
  depth,
  expanded,
  onToggle,
  borderColor,
  mutedColor,
}: {
  node: ScoringTreeNode;
  depth: number;
  expanded: boolean;
  onToggle: () => void;
  borderColor: string;
  mutedColor: string;
}) {
  const hasChildren = Boolean(node.children?.length);
  const padLeft = depth * authSpacing.md;

  return (
    <Pressable
      accessibilityRole={hasChildren ? 'button' : 'text'}
      accessibilityState={{ expanded: hasChildren ? expanded : undefined }}
      disabled={!hasChildren}
      onPress={hasChildren ? onToggle : undefined}
      style={[styles.row, { paddingLeft: padLeft, borderColor }]}>
      <View style={styles.rowLeft}>
        {hasChildren ? (
          <HeroIcon
            name={expanded ? 'chevron-down' : 'chevron-right'}
            size={18}
            color={mutedColor}
          />
        ) : (
          <View style={styles.leafSpacer} />
        )}
        <HeroIcon
          name={node.earned ? 'check-circle' : 'lock-closed'}
          size={18}
          color={node.earned ? authColors.text : mutedColor}
        />
        <View style={styles.textBlock}>
          <Text style={styles.label}>{node.label}</Text>
          {node.detail ? (
            <Text style={[styles.detail, { color: mutedColor }]}>{node.detail}</Text>
          ) : null}
        </View>
      </View>
      {node.points != null ? (
        <Text style={[styles.points, { color: node.earned ? authColors.text : mutedColor }]}>
          {node.earned ? `+${node.points}` : `${node.points} pts`}
        </Text>
      ) : null}
    </Pressable>
  );
}

function TreeBranch({
  node,
  depth,
  expandedIds,
  onToggle,
  borderColor,
  mutedColor,
}: {
  node: ScoringTreeNode;
  depth: number;
  expandedIds: ReadonlySet<string>;
  onToggle: (id: string) => void;
  borderColor: string;
  mutedColor: string;
}) {
  const expanded = expandedIds.has(node.id);
  return (
    <View>
      <TreeNodeRow
        node={node}
        depth={depth}
        expanded={expanded}
        onToggle={() => onToggle(node.id)}
        borderColor={borderColor}
        mutedColor={mutedColor}
      />
      {expanded && node.children
        ? node.children.map((child) => (
            <TreeBranch
              key={child.id}
              node={child}
              depth={depth + 1}
              expandedIds={expandedIds}
              onToggle={onToggle}
              borderColor={borderColor}
              mutedColor={mutedColor}
            />
          ))
        : null}
    </View>
  );
}

export const ScoringBadgesTree = forwardRef<ScoringBadgesTreeHandle, Props>(function ScoringBadgesTree(
  { userId, borderColor, mutedColor },
  ref,
) {
  const { snapshot, loading, error, refetch } = useUserScoringSnapshot(userId);

  useImperativeHandle(ref, () => ({ refetch }), [refetch]);

  const [expandedIds, setExpandedIds] = useState<Set<string>>(
    () => new Set(['badges', 'disciplines', 'main:botanist']),
  );

  const mains = snapshot?.mains ?? [];
  const awardKeys = snapshot?.awardKeys ?? new Set<string>();
  const breakdown = snapshot?.breakdown ?? null;

  const tree = useMemo(() => buildScoringTree(mains, awardKeys), [mains, awardKeys]);

  function toggle(id: string) {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  const totalEarned = awardKeys.size;

  return (
    <View style={styles.wrap}>
      <View style={styles.header}>
        <HeroIcon name="trophy" size={22} color={authColors.text} />
        <Text style={styles.title}>Scoring & badges</Text>
      </View>
      <Text style={[styles.subtitle, { color: mutedColor }]}>
        {totalEarned} milestone{totalEarned === 1 ? '' : 's'} earned · tap rows to expand
      </Text>

      {loading && tree.length === 0 ? (
        <CenteredActivityIndicator color={mutedColor} />
      ) : null}
      {error ? (
        <ErrorRetryBlock message={error} onRetry={() => void refetch()} />
      ) : null}

      {!error && breakdown && breakdown.rows.length > 0 ? (
        <ScoreByCategorySummary
          rows={breakdown.rows}
          totalPoints={breakdown.totalPoints}
          totalDetectionPoints={breakdown.totalDetectionPoints}
          totalAwardPoints={breakdown.totalAwardPoints}
          borderColor={borderColor}
          mutedColor={mutedColor}
        />
      ) : null}

      {!error ? (
        <ScrollView
          style={[styles.tree, { borderColor }]}
          nestedScrollEnabled
          showsVerticalScrollIndicator={false}>
          {tree.map((root) => (
            <TreeBranch
              key={root.id}
              node={root}
              depth={0}
              expandedIds={expandedIds}
              onToggle={toggle}
              borderColor={borderColor}
              mutedColor={mutedColor}
            />
          ))}
        </ScrollView>
      ) : null}
    </View>
  );
});

const styles = StyleSheet.create({
  wrap: {
    gap: authSpacing.sm,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: authSpacing.sm,
  },
  title: {
    ...authTypography.title,
    fontSize: 20,
    color: authColors.text,
  },
  subtitle: {
    ...authTypography.subtitle,
  },
  tree: {
    borderWidth: 1,
    borderRadius: 4,
    maxHeight: 520,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: authSpacing.sm,
    paddingVertical: authSpacing.sm,
    paddingRight: authSpacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  rowLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: authSpacing.xs,
  },
  leafSpacer: {
    width: 18,
  },
  textBlock: {
    flex: 1,
    gap: 2,
  },
  label: {
    ...authTypography.body,
    color: authColors.text,
  },
  detail: {
    ...authTypography.subtitle,
    fontSize: 12,
    lineHeight: 16,
  },
  points: {
    ...authTypography.subtitle,
    fontWeight: '600',
  },
});
