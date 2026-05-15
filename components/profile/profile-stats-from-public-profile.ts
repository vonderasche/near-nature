import type { ProfileStatStripProps } from '@/components/profile/profile-stat-strip';
import type { PublicUserProfile } from '@/services/userService';

/** Maps RPC profile row to {@link ProfileStatStrip} props (owner vs public counts). */
export function profileStatStripPropsFromPublicProfile(
  profile: PublicUserProfile,
  mutedColor: string,
  accentColor: string
): ProfileStatStripProps {
  const ownerDet = profile.ownerDetectionCount;
  const ownerSpec = profile.ownerSpeciesCount;
  const isOwnerView = ownerDet != null && ownerSpec != null;

  return {
    currentStreak: profile.currentStreak,
    longestStreak: profile.longestStreak,
    detectionCount: isOwnerView ? ownerDet : profile.publicDetectionCount,
    speciesCount: isOwnerView ? ownerSpec : profile.publicSpeciesCount,
    detectionCaption: isOwnerView ? 'All identifications' : 'Public gallery',
    mutedColor,
    accentColor,
  };
}
