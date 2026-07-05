import * as Haptics from 'expo-haptics';
import { useCallback, useState } from 'react';

import {
  pickPhotosFromGallery,
  type PickPhotosFromGalleryResult,
} from '@/lib/camera/pickPhotoFromGallery';

export function usePickPhotoFromGallery() {
  const [picking, setPicking] = useState(false);

  const pickFromGallery = useCallback(async (): Promise<PickPhotosFromGalleryResult> => {
    if (picking) return { ok: false, reason: 'cancelled' };
    setPicking(true);
    try {
      const result = await pickPhotosFromGallery();
      if (result.ok) {
        try {
          void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        } catch {
          /* haptics unavailable */
        }
      }
      return result;
    } finally {
      setPicking(false);
    }
  }, [picking]);

  return { pickFromGallery, picking };
}
