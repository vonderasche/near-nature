import { useEffect, useState } from 'react';

import {
  isMvpLivePreviewSuspended,
  isMvpPreviewResumeBlocked,
  subscribeMvpLivePreviewSuspended,
  subscribeMvpPreviewResumeBlocked,
} from '@/lib/camera/tflite/mvp/mvpTfliteMemory';

function isMvpPreviewPipelinePaused(): boolean {
  return isMvpLivePreviewSuspended() || isMvpPreviewResumeBlocked();
}

/** Reactive flag while capture inference or post-capture cooldown has paused live preview. */
export function useMvpLivePreviewSuspended(): boolean {
  const [paused, setPaused] = useState(isMvpPreviewPipelinePaused);

  useEffect(() => {
    const sync = () => setPaused(isMvpPreviewPipelinePaused());
    const unsubSuspend = subscribeMvpLivePreviewSuspended(sync);
    const unsubCooldown = subscribeMvpPreviewResumeBlocked(sync);
    return () => {
      unsubSuspend();
      unsubCooldown();
    };
  }, []);

  return paused;
}
