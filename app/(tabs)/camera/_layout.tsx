import { Stack, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';

import { ThemedConfirmModal } from '@/components/ui/themed-sheet-dialog';
import { CameraFlowProvider } from '@/context/CameraFlowContext';
import { routes } from '@/lib/routing/routes';

export default function CameraStackLayout() {
  const router = useRouter();
  const [backgroundSaveError, setBackgroundSaveError] = useState<{
    title: string;
    message: string;
  } | null>(null);

  const reportBackgroundSaveError = useCallback((message: string) => {
    setBackgroundSaveError({
      title: 'Save failed',
      message,
    });
  }, []);

  return (
    <CameraFlowProvider reportBackgroundSaveError={reportBackgroundSaveError}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="identification" />
        <Stack.Screen name="detection/[detectionId]" />
      </Stack>
      <ThemedConfirmModal
        visible={backgroundSaveError !== null}
        title={backgroundSaveError?.title ?? 'Save failed'}
        message={
          backgroundSaveError?.message
            ? `${backgroundSaveError.message} Open your profile to check your gallery or try saving again.`
            : 'Your identification could not be saved. Open your profile to check your gallery or try again.'
        }
        cancelLabel="Dismiss"
        confirmLabel="Open profile"
        confirmDestructive={false}
        onCancel={() => setBackgroundSaveError(null)}
        onConfirm={() => {
          setBackgroundSaveError(null);
          router.push(routes.profileTab);
        }}
      />
    </CameraFlowProvider>
  );
}
