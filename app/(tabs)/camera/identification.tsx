import { Redirect, useRouter, type Href } from 'expo-router';
import { useCallback, useEffect, useRef } from 'react';

import { CameraIdentificationPanel } from '@/components/camera/camera-identification-panel';
import { useCameraFlowContext } from '@/context/CameraFlowContext';
import { useIdentificationRouteParams } from '@/hooks/useIdentificationRouteParams';
import { isMvpCaptureEnabled } from '@/lib/camera/tflite/mvp/isMvpCaptureEnabled';
import {
  completeMvpCaptureSessionAndWait,
  finishMvpCaptureSession,
} from '@/lib/camera/tflite/mvp/mvpTfliteMemory';
import { routes } from '@/lib/routing/routes';
import { RegionComingSoon } from '@/components/shared/region-coming-soon';
import { useActiveRegion } from '@/context/RegionContext';

export default function IdentificationScreen() {
  const router = useRouter();
  const { isLive } = useActiveRegion();
  const { photoUri } = useIdentificationRouteParams();
  const { reportBackgroundSaveError } = useCameraFlowContext();
  const retakeCleanupStartedRef = useRef(false);

  const handleRetake = useCallback(() => {
    retakeCleanupStartedRef.current = true;
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace(routes.cameraTab as Href);
    }
    if (isMvpCaptureEnabled()) {
      void completeMvpCaptureSessionAndWait();
    }
  }, [router]);

  useEffect(() => {
    return () => {
      if (!isMvpCaptureEnabled() || retakeCleanupStartedRef.current) {
        return;
      }
      finishMvpCaptureSession();
    };
  }, []);

  if (!photoUri) {
    return <Redirect href={routes.cameraTab} />;
  }

  if (!isLive) {
    return (
      <RegionComingSoon feature="camera" showProfileAction />
    );
  }

  return (
    <CameraIdentificationPanel
      key={photoUri}
      photoUri={photoUri}
      onRetake={handleRetake}
      onBackgroundSaveError={reportBackgroundSaveError}
    />
  );
}
