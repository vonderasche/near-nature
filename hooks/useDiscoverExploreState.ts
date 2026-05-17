import { DEFAULT_USER_STATE } from '@/constants/user-defaults';
import { useAuthContext } from '@/context/AuthContext';
import { useUserHomeState } from '@/hooks/useUserHomeState';
import { stateNameFromCode } from '@/lib/explore/exploreSpeciesTypes';

/**
 * Shared Discover explore state: signed-in home state, guest sample preview, fetch gates.
 */
export function useDiscoverExploreState() {
  const { userId } = useAuthContext();
  const { stateCode, hasHomeState, loading: stateLoading } = useUserHomeState();
  const isSignedIn = Boolean(userId);
  const isGuestPreview = !isSignedIn;
  const needsHomeState = isSignedIn && !stateLoading && !hasHomeState;

  const activeStateCode = isSignedIn
    ? hasHomeState
      ? stateCode
      : ''
    : DEFAULT_USER_STATE;
  const exploreStateName = activeStateCode ? stateNameFromCode(activeStateCode) : '';

  const canLoadExploreContent =
    !stateLoading && (isGuestPreview || (isSignedIn && hasHomeState));
  const isExploreStateReady = canLoadExploreContent;

  return {
    stateCode: activeStateCode || stateCode,
    stateName: exploreStateName,
    exploreStateName,
    hasHomeState,
    stateLoading,
    isSignedIn,
    isGuestPreview,
    needsHomeState,
    canLoadExploreContent,
    isExploreStateReady,
    /** Guest sample browse (Florida default). */
    isPreviewState: isGuestPreview,
    /** @deprecated Use isSignedIn */
    canFetch: isSignedIn,
  };
}
