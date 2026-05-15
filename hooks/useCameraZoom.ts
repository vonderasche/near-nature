import * as Haptics from 'expo-haptics';
import { useCallback, useEffect, useMemo, useState } from 'react';
import type { CameraDevice } from 'react-native-vision-camera';

import {
  buildZoomChips,
  clampZoom,
  findActiveZoomChipId,
  type ZoomChip,
} from '@/lib/camera/cameraZoom';

export function useCameraZoom(device: CameraDevice | undefined) {
  const [zoom, setZoomState] = useState(1);

  const chips = useMemo(() => (device ? buildZoomChips(device) : []), [device]);

  useEffect(() => {
    if (!device) return;
    setZoomState(device.neutralZoom);
  }, [device]);

  const setZoom = useCallback(
    (value: number) => {
      if (!device) return;
      setZoomState(clampZoom(value, device));
    },
    [device],
  );

  const selectChip = useCallback(
    (chip: ZoomChip) => {
      try {
        void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } catch {
        /* haptics unavailable */
      }
      setZoom(chip.zoom);
    },
    [setZoom],
  );

  const activeChipId = device ? findActiveZoomChipId(chips, zoom) : null;

  return {
    zoom,
    setZoom,
    chips,
    activeChipId,
    selectChip,
  };
}
