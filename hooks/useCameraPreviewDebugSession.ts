import { useFocusEffect } from '@react-navigation/native';
import { randomUUID } from 'expo-crypto';
import { useCallback, useRef } from 'react';

import { useActiveRegion } from '@/context/RegionContext';
import {
  clearGlobalClassificationDebugSession,
  createClassificationDebugSession,
} from '@/lib/classification/debug';

/** Keeps a preview-scoped telemetry session alive while the camera tab is focused. */
export function useCameraPreviewDebugSession(enabled: boolean): void {
  const { regionId } = useActiveRegion();
  const sessionRef = useRef<ReturnType<typeof createClassificationDebugSession> | null>(null);

  useFocusEffect(
    useCallback(() => {
      if (!enabled) return;
      const session = createClassificationDebugSession(randomUUID(), regionId);
      sessionRef.current = session;
      return () => {
        void session.dispose();
        clearGlobalClassificationDebugSession(session);
        sessionRef.current = null;
      };
    }, [enabled, regionId]),
  );
}
