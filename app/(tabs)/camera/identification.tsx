import { Redirect, useRouter } from 'expo-router';

import { CameraIdentificationPanel } from '@/components/camera/camera-identification-panel';
import { useCameraFlowContext } from '@/context/CameraFlowContext';
import { useIdentificationRouteParams } from '@/hooks/useIdentificationRouteParams';
import { routes } from '@/lib/routing/routes';

export default function IdentificationScreen() {
  const router = useRouter();
  const { photoUri } = useIdentificationRouteParams();
  const { reportBackgroundSaveError } = useCameraFlowContext();

  if (!photoUri) {
    return <Redirect href={routes.cameraTab} />;
  }

  return (
    <CameraIdentificationPanel
      key={photoUri}
      photoUri={photoUri}
      onRetake={() => router.back()}
      onBackgroundSaveError={reportBackgroundSaveError}
    />
  );
}
