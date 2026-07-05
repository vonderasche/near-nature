import { useEffect, useState } from 'react';

import {
  getBackgroundGalleryQueueSnapshot,
  subscribeBackgroundGalleryQueue,
  type BackgroundGalleryQueueSnapshot,
} from '@/lib/camera/backgroundGalleryIdentificationQueue';

export function useBackgroundGalleryQueue(): BackgroundGalleryQueueSnapshot {
  const [state, setState] = useState(getBackgroundGalleryQueueSnapshot);

  useEffect(() => subscribeBackgroundGalleryQueue(setState), []);

  return state;
}
