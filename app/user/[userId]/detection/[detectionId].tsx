import { useLocalSearchParams } from 'expo-router';

import { DetectionDetailScreenBody } from '@/components/profile/detection-detail-screen-body';
import { paramToString } from '@/lib/routing/searchParams';

export default function PublicUserDetectionDetailScreen() {
  const detectionId = paramToString(useLocalSearchParams<{ detectionId?: string | string[] }>().detectionId);

  return <DetectionDetailScreenBody detectionId={detectionId} showMemberProfileLink />;
}
