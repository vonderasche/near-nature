import type { ReactNode } from 'react';

import { DiscoverGuestSignInBanner } from '@/components/discover/discover-guest-sign-in-banner';
import { DiscoverSetHomeStatePrompt } from '@/components/discover/discover-set-home-state-prompt';
import { CenteredActivityIndicator } from '@/components/profile/centered-activity-indicator';
import { authColors } from '@/constants/auth-theme';

type Props = {
  isSignedIn: boolean;
  stateLoading: boolean;
  needsHomeState: boolean;
  isGuestPreview: boolean;
  stateName: string;
  children: ReactNode;
};

/**
 * Shared loading / home-state / guest preview for Discover stack screens.
 */
export function DiscoverExploreGate({
  isSignedIn,
  stateLoading,
  needsHomeState,
  isGuestPreview,
  stateName,
  children,
}: Props) {
  if (isSignedIn && stateLoading) {
    return <CenteredActivityIndicator color={authColors.text} accessibilityLabel="Loading home state" />;
  }
  if (needsHomeState) {
    return <DiscoverSetHomeStatePrompt />;
  }
  return (
    <>
      {isGuestPreview && stateName ? <DiscoverGuestSignInBanner stateName={stateName} /> : null}
      {children}
    </>
  );
}
