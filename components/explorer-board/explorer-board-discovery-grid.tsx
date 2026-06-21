import { useRouter, type Href } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { DetectionGalleryGrid } from '@/components/profile/detection-gallery-grid';
import { GalleryGridColumnsPicker } from '@/components/profile/gallery-grid-columns-picker';
import { useTheme } from '@/hooks/useTheme';
import { useGalleryGridColumns } from '@/hooks/useGalleryGridColumns';
import { stageGalleryItem } from '@/lib/gallery/galleryItemRouteCache';
import { routeCameraDetection, routePublicUserDetection, routePublicUserProfile } from '@/lib/routing/routes';
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
  const { theme } = useTheme();
  const { columns, setColumnCount } = useGalleryGridColumns();

  const openDetection = (item: DetectionGalleryItem) => {
    stageGalleryItem(item);
    if (item.ownerUserId) {
      router.push(
        routePublicUserDetection({ userId: item.ownerUserId, detectionId: item.id }) as unknown as Href,
      );
      return;
    }
    router.push(routeCameraDetection({ detectionId: item.id }) as unknown as Href);
  };

  return (
    <View style={[styles.wrap, { gap: theme.spacing.sm }]}>
      <View style={styles.toolbar}>
        <GalleryGridColumnsPicker value={columns} onChange={setColumnCount} />
      </View>
      {totalCount != null && totalCount > 0 ? (
        <Text style={[styles.resultCount, { color: theme.colors.textSecondary }]}>
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
        onOpenDetection={openDetection}
        onViewMemberProfile={(userId) => router.push(routePublicUserProfile(userId) as unknown as Href)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {},
  toolbar: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  resultCount: {
    fontSize: 13,
    lineHeight: 18,
  },
});
