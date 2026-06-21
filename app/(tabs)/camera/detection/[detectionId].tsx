import { useLocalSearchParams } from 'expo-router';

import { DetectionDetailScreenBody } from '@/components/profile/detection-detail-screen-body';
import { useUser } from '@/hooks/useUser';
import { paramToString } from '@/lib/routing/searchParams';

export default function CameraDetectionDetailScreen() {
  const detectionId = paramToString(useLocalSearchParams<{ detectionId?: string | string[] }>().detectionId);
  const { user } = useUser();

  return (
    <DetectionDetailScreenBody
      detectionId={detectionId}
      doneLabel="Back"
      fetchOptions={{ userId: user?.id }}
    />
  );
}
