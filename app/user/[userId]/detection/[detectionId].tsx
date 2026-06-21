import { useLocalSearchParams } from 'expo-router';

import { DetectionDetailScreenBody } from '@/components/profile/detection-detail-screen-body';
import { paramToString } from '@/lib/routing/searchParams';

export default function PublicUserDetectionDetailScreen() {
  const params = useLocalSearchParams<{ userId?: string | string[]; detectionId?: string | string[] }>();
  const userId = paramToString(params.userId);
  const detectionId = paramToString(params.detectionId);

  return (
    <DetectionDetailScreenBody
      detectionId={detectionId}
      showMemberProfileLink
      fetchOptions={{ userId: userId || undefined, publicOnly: true }}
    />
  );
}
