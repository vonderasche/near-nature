import { useEffect, useState } from 'react';

import {
  isMvpCaptureSessionActive,
  subscribeMvpCaptureSessionActive,
} from '@/lib/camera/tflite/mvp/mvpTfliteMemory';

export function useMvpCaptureSessionActive(): boolean {
  const [active, setActive] = useState(isMvpCaptureSessionActive);

  useEffect(() => subscribeMvpCaptureSessionActive(() => setActive(isMvpCaptureSessionActive())), []);

  return active;
}
