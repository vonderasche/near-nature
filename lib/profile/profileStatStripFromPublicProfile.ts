import type { ProfileStatStripProps } from '@/components/profile/profile-stat-strip';
import type { PublicUserProfile } from '@/services/userService';

/** Maps RPC profile row to {@link ProfileStatStrip} props (owner vs public points). */
export function profileStatStripPropsFromPublicProfile(
  profile: PublicUserProfile,
  mutedColor: string,
  accentColor: string
): ProfileStatStripProps {
  const ownerPoints = profile.ownerPoints;
  const ownerSpec = profile.ownerSpeciesCount;
  const isOwnerView = ownerPoints != null && ownerSpec != null;

  return {
    currentStreak: profile.currentStreak,
    longestStreak: profile.longestStreak,
    pointsTotal: isOwnerView ? ownerPoints : profile.publicPoints,
    speciesCount: isOwnerView ? ownerSpec : profile.publicSpeciesCount,
    pointsCaption: isOwnerView ? 'All saves' : 'Public saves',
    mutedColor,
    accentColor,
  };
}
