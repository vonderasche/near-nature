import { useFocusEffect, useIsFocused } from '@react-navigation/native';
import { useCallback, useEffect, useRef, useState } from 'react';
import { AppState, type AppStateStatus } from 'react-native';

/**
 * Vision Camera must pause when the app or tab is inactive; remount preview after background
 * or tab blur so the feed recovers (otherwise the view can stay black on resume).
 */
export function useCameraPreviewLifecycle(): {
  isPreviewActive: boolean;
  previewKey: number;
  isResumingPreview: boolean;
} {
  const isFocused = useIsFocused();
  const [appState, setAppState] = useState<AppStateStatus>(() => AppState.currentState);
  const [previewKey, setPreviewKey] = useState(0);
  const [isResumingPreview, setIsResumingPreview] = useState(false);
  const appStateRef = useRef(appState);

  const remountPreview = useCallback(() => {
    setPreviewKey((k) => k + 1);
    setIsResumingPreview(true);
  }, []);

  useEffect(() => {
    appStateRef.current = appState;
  }, [appState]);

  useEffect(() => {
    const sub = AppState.addEventListener('change', (next) => {
      const prev = appStateRef.current;
      appStateRef.current = next;
      setAppState(next);
      if (next === 'active' && prev !== 'active') {
        remountPreview();
      }
    });
    return () => sub.remove();
  }, [remountPreview]);

  const shouldRemountOnFocusRef = useRef(false);
  useFocusEffect(
    useCallback(() => {
      if (shouldRemountOnFocusRef.current) {
        remountPreview();
      }
      shouldRemountOnFocusRef.current = false;
      return () => {
        shouldRemountOnFocusRef.current = true;
      };
    }, [remountPreview]),
  );

  useEffect(() => {
    if (!isResumingPreview) return;
    const timer = setTimeout(() => setIsResumingPreview(false), 500);
    return () => clearTimeout(timer);
  }, [isResumingPreview, previewKey]);

  const isPreviewActive = isFocused && appState === 'active';

  return { isPreviewActive, previewKey, isResumingPreview };
}
