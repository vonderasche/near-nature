import { useRouter } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { DetectionGalleryGrid } from '@/components/profile/detection-gallery-grid';
import { GalleryGridColumnsPicker } from '@/components/profile/gallery-grid-columns-picker';
import { authColors, authSpacing } from '@/constants/auth-theme';
import { useGalleryGridColumns } from '@/hooks/useGalleryGridColumns';
import { routePublicUserProfile } from '@/lib/routing/routes';
import type { DetectionGalleryItem } from '@/types';

type Props = {
  items: DetectionGalleryItem[];
  loading: boolean;
  isLoadingMore: boolean;
  hasMore: boolean;
  totalCount: number | null;
  searchQuery: string;
  error: string | null;
  onRetry: () => void;
  onLoadMore: () => void;
};

/**
 * Community identification grid shown when Explorer Board search is active.
 */
export function ExplorerBoardDiscoveryGrid({
  items,
  loading,
  isLoadingMore,
  hasMore,
  totalCount,
  searchQuery,
  error,
  onRetry,
  onLoadMore,
}: Props) {
  const router = useRouter();
  const { columns, setColumnCount } = useGalleryGridColumns();

  return (
    <View style={styles.wrap}>
      <View style={styles.toolbar}>
        <GalleryGridColumnsPicker value={columns} onChange={setColumnCount} />
      </View>
      {totalCount != null && totalCount > 0 ? (
        <Text style={styles.resultCount}>
          {totalCount === 1 ? '1 identification' : `${totalCount} identifications`}
        </Text>
      ) : null}
      <DetectionGalleryGrid
        items={items}
        columnCount={columns}
        loading={loading}
        hasMore={hasMore}
        isLoadingMore={isLoadingMore}
        onLoadMore={onLoadMore}
        error={error}
        onRetry={onRetry}
        searchQuery={searchQuery}
        sourceItemCount={totalCount ?? items.length}
        emptyMessage="No public identifications match your search yet. Sensitive species are only visible on your profile, not in community search."
        onViewMemberProfile={(userId) => router.push(routePublicUserProfile(userId))}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: authSpacing.sm,
  },
  toolbar: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  resultCount: {
    fontSize: 13,
    lineHeight: 18,
    color: authColors.textMuted,
  },
});
