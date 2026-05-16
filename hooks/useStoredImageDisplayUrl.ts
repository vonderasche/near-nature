import { useEffect, useState } from 'react';

import { getDetectionImageDisplayUrl } from '@/services/detectionImageUrl';

/**
 * Resolves a stored bucket/public URL to a displayable URI (signed when needed).
 */
export function useStoredImageDisplayUrl(storedUrl: string | null | undefined) {
  const [displayUri, setDisplayUri] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const raw = storedUrl?.trim();
    if (!raw) {
      setDisplayUri(null);
      return;
    }
    setDisplayUri(null);
    void getDetectionImageDisplayUrl(raw).then((url) => {
      if (!cancelled) setDisplayUri(url.trim().length > 0 ? url : null);
    });
    return () => {
      cancelled = true;
    };
  }, [storedUrl]);

  return displayUri;
}
