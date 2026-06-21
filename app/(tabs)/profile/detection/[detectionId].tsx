import { Redirect, useLocalSearchParams, useRouter } from 'expo-router';

import { DetectionGalleryDetailContent } from '@/components/profile/detection-gallery-detail-content';
import { Screen } from '@/components/ui/Screen';
import { StackScreenHeader } from '@/components/ui/StackScreenHeader';
import { Text } from '@/components/ui/Text';
import { useAuthContext } from '@/context/AuthContext';
import { useDeleteDetection } from '@/hooks/useDeleteDetection';
import { useTheme } from '@/hooks/useTheme';
import { useUser } from '@/hooks/useUser';
import { clearStagedGalleryItem, getStagedGalleryItem } from '@/lib/gallery/galleryItemRouteCache';
import { paramToString } from '@/lib/routing/searchParams';
import { routes } from '@/lib/routing/routes';

export default function ProfileDetectionDetailScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const { isAuthenticated, isLoading: authLoading } = useAuthContext();
  const detectionId = paramToString(useLocalSearchParams<{ detectionId?: string | string[] }>().detectionId);
  const { refresh } = useUser();
  const { deleteById, deletingId } = useDeleteDetection();

  if (!authLoading && !isAuthenticated) {
    return <Redirect href={routes.login} />;
  }

  const item = detectionId ? getStagedGalleryItem(detectionId) : undefined;

  if (!detectionId || !item) {
    return (
      <Screen>
        <StackScreenHeader title="Identification" />
        <Text variant="subtitle" color="secondary">
          This identification is no longer available. Go back and open it again from your gallery.
        </Text>
      </Screen>
    );
  }

  return (
    <Screen>
      <StackScreenHeader title="Identification" />
      <DetectionGalleryDetailContent
        item={item}
        deletable
        deleteBusy={deletingId === item.id}
        onRequestDelete={async (row) => {
          const result = await deleteById(row.id);
          if (result.ok) {
            clearStagedGalleryItem(row.id);
            await refresh();
          }
          return result;
        }}
        onDone={() => router.back()}
        doneLabel="Back to gallery"
      />
    </Screen>
  );
}
