import { useCallback, useEffect } from 'react';

import {
  DEFAULT_CLASSIFICATION_DEBUG_OPT_IN,
  DEFAULT_CLASSIFICATION_DEBUG_THUMBNAILS,
  PREF_CLASSIFICATION_DEBUG_OPT_IN,
  PREF_CLASSIFICATION_DEBUG_THUMBNAILS,
} from '@/constants/classification-debug-preferences';
import { usePersistedPreference } from '@/hooks/usePersistedPreference';
import {
  isClassificationDebugFeatureAvailable,
  setClassificationDebugIncludeThumbnails,
  setClassificationDebugUserOptIn,
} from '@/lib/classification/debug/isClassificationDebugEnabled';

function parseBool(raw: string | null, fallback: boolean): boolean {
  if (raw === 'true') return true;
  if (raw === 'false') return false;
  return fallback;
}

export function useClassificationDebugPreference() {
  const featureAvailable = isClassificationDebugFeatureAvailable();
  const optInPref = usePersistedPreference(
    PREF_CLASSIFICATION_DEBUG_OPT_IN,
    (raw) => parseBool(raw, DEFAULT_CLASSIFICATION_DEBUG_OPT_IN),
    DEFAULT_CLASSIFICATION_DEBUG_OPT_IN,
  );
  const thumbnailsPref = usePersistedPreference(
    PREF_CLASSIFICATION_DEBUG_THUMBNAILS,
    (raw) => parseBool(raw, DEFAULT_CLASSIFICATION_DEBUG_THUMBNAILS),
    DEFAULT_CLASSIFICATION_DEBUG_THUMBNAILS,
  );

  useEffect(() => {
    if (!featureAvailable || !optInPref.ready) return;
    setClassificationDebugUserOptIn(optInPref.value);
  }, [featureAvailable, optInPref.ready, optInPref.value]);

  useEffect(() => {
    if (!featureAvailable || !thumbnailsPref.ready) return;
    setClassificationDebugIncludeThumbnails(thumbnailsPref.value && optInPref.value);
  }, [featureAvailable, optInPref.value, thumbnailsPref.ready, thumbnailsPref.value]);

  const setOptIn = useCallback(
    (next: boolean) => {
      optInPref.setValue(next);
      if (!next) {
        thumbnailsPref.setValue(false);
      }
    },
    [optInPref, thumbnailsPref],
  );

  const setThumbnails = useCallback(
    (next: boolean) => {
      thumbnailsPref.setValue(next);
    },
    [thumbnailsPref],
  );

  return {
    ready: optInPref.ready && thumbnailsPref.ready,
    optIn: optInPref.value,
    setOptIn,
    thumbnails: thumbnailsPref.value && optInPref.value,
    setThumbnails,
  };
}
