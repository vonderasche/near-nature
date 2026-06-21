import { Redirect } from 'expo-router';
import { useLocalSearchParams } from 'expo-router';

import { DetectionDetailScreenBody } from '@/components/profile/detection-detail-screen-body';
import { useAuthContext } from '@/context/AuthContext';
import { useDeleteDetection } from '@/hooks/useDeleteDetection';
import { useUser } from '@/hooks/useUser';
import { paramToString } from '@/lib/routing/searchParams';
import { routes } from '@/lib/routing/routes';

export default function ProfileDetectionDetailScreen() {
  const { isAuthenticated, isLoading: authLoading } = useAuthContext();
  const detectionId = paramToString(useLocalSearchParams<{ detectionId?: string | string[] }>().detectionId);
  const { refresh } = useUser();
  const { deleteById, deletingId } = useDeleteDetection();

  if (!authLoading && !isAuthenticated) {
    return <Redirect href={routes.login} />;
  }

  return (
    <DetectionDetailScreenBody
      detectionId={detectionId}
      deletable
      deletingId={deletingId}
      onDeleteItem={(item) => deleteById(item.id)}
      onDeleted={() => refresh()}
    />
  );
}
