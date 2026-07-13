import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';

import { ACTIVE_REGION_OVERRIDE_STORAGE_KEY } from '@/constants/region-storage';
import {
  DEFAULT_REGION_PACK_ID,
  regionDisplayLabel,
  regionLabel,
  resolveRegionFromState,
  type RegionPackId,
} from '@/constants/regions';
import { normalizeRegionPackId } from '@/lib/region/regionPackLegacy';
import { useUserHomeState } from '@/hooks/useUserHomeState';
import {
  ensureGlobalCaptureModels,
  refreshGlobalCaptureModelBundleReadyCache,
  type EnsureGlobalCaptureModelsProgress,
} from '@/lib/region/globalCaptureModelBundle';
import { isRegionReady } from '@/lib/region/regionReadiness';

export type RegionSource = 'auto' | 'manual';

export type RegionDownloadState = 'idle' | 'downloading' | 'ready' | 'error';

export type ActiveRegion = {
  regionId: RegionPackId;
  source: RegionSource;
  isLive: boolean;
  label: string;
  displayLabel: string;
};

type RegionContextValue = {
  activeRegion: ActiveRegion;
  ready: boolean;
  captureModelsReady: boolean;
  downloadState: RegionDownloadState;
  downloadProgress: number;
  retryDownload: () => void;
  setRegionManual: (regionId: RegionPackId) => void;
  clearManualOverride: () => void;
};

const RegionContext = createContext<RegionContextValue | null>(null);

function buildActiveRegion(
  regionId: RegionPackId,
  source: RegionSource,
  captureModelsReady: boolean,
): ActiveRegion {
  return {
    regionId,
    source,
    isLive: isRegionReady(regionId, captureModelsReady),
    label: regionLabel(regionId),
    displayLabel: regionDisplayLabel(regionId),
  };
}

function progressRatio(progress: EnsureGlobalCaptureModelsProgress): number {
  if (progress.totalBytes > 0) {
    return Math.min(1, progress.bytesDownloaded / progress.totalBytes);
  }
  if (progress.totalFiles > 0) {
    return Math.min(1, progress.completedFiles / progress.totalFiles);
  }
  return 0;
}

export function RegionProvider({ children }: { children: ReactNode }) {
  const { stateCode, loading: homeStateLoading } = useUserHomeState();
  const [manualOverride, setManualOverride] = useState<RegionPackId | null>(null);
  const [storageReady, setStorageReady] = useState(false);
  const [captureModelsReady, setCaptureModelsReady] = useState(false);
  const [downloadState, setDownloadState] = useState<RegionDownloadState>('idle');
  const [downloadProgress, setDownloadProgress] = useState(0);
  const downloadGenerationRef = useRef(0);

  useEffect(() => {
    let cancelled = false;
    void AsyncStorage.getItem(ACTIVE_REGION_OVERRIDE_STORAGE_KEY).then((raw) => {
      if (cancelled) return;
      const regionId = normalizeRegionPackId(raw);
      setManualOverride(regionId);
      if (regionId && raw !== regionId) {
        void AsyncStorage.setItem(ACTIVE_REGION_OVERRIDE_STORAGE_KEY, regionId);
      }
      setStorageReady(true);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const autoRegionId = useMemo(
    () => resolveRegionFromState(homeStateLoading ? null : stateCode),
    [homeStateLoading, stateCode],
  );

  const activeRegionId = manualOverride ?? autoRegionId;

  const runGlobalCaptureDownload = useCallback(async () => {
    const generation = downloadGenerationRef.current + 1;
    downloadGenerationRef.current = generation;

    setDownloadState('idle');
    setDownloadProgress(0);

    const cachedReady = await refreshGlobalCaptureModelBundleReadyCache();
    if (downloadGenerationRef.current !== generation) return;

    if (cachedReady) {
      setCaptureModelsReady(true);
      setDownloadState('ready');
      setDownloadProgress(1);
      return;
    }

    setDownloadState('downloading');
    setCaptureModelsReady(false);

    const ok = await ensureGlobalCaptureModels({
      onProgress: (progress) => {
        if (downloadGenerationRef.current !== generation) return;
        setDownloadProgress(progressRatio(progress));
      },
    });

    if (downloadGenerationRef.current !== generation) return;

    setCaptureModelsReady(ok);
    setDownloadState(ok ? 'ready' : 'error');
    setDownloadProgress(ok ? 1 : 0);
  }, []);

  useEffect(() => {
    void runGlobalCaptureDownload();
  }, [runGlobalCaptureDownload]);

  const activeRegion = useMemo(
    () => buildActiveRegion(activeRegionId, manualOverride ? 'manual' : 'auto', captureModelsReady),
    [activeRegionId, manualOverride, captureModelsReady],
  );

  const setRegionManual = useCallback((regionId: RegionPackId) => {
    setManualOverride(regionId);
    void AsyncStorage.setItem(ACTIVE_REGION_OVERRIDE_STORAGE_KEY, regionId);
  }, []);

  const clearManualOverride = useCallback(() => {
    setManualOverride(null);
    void AsyncStorage.removeItem(ACTIVE_REGION_OVERRIDE_STORAGE_KEY);
  }, []);

  const retryDownload = useCallback(() => {
    void runGlobalCaptureDownload();
  }, [runGlobalCaptureDownload]);

  const ready = storageReady && !homeStateLoading;

  const value = useMemo(
    () => ({
      activeRegion,
      ready,
      captureModelsReady,
      downloadState,
      downloadProgress,
      retryDownload,
      setRegionManual,
      clearManualOverride,
    }),
    [
      activeRegion,
      ready,
      captureModelsReady,
      downloadState,
      downloadProgress,
      retryDownload,
      setRegionManual,
      clearManualOverride,
    ],
  );

  return <RegionContext.Provider value={value}>{children}</RegionContext.Provider>;
}

export function useActiveRegion(): ActiveRegion {
  const ctx = useContext(RegionContext);
  if (!ctx) {
    return buildActiveRegion(DEFAULT_REGION_PACK_ID, 'auto', false);
  }
  return ctx.activeRegion;
}

export function useRegionDownloadState(): Pick<
  RegionContextValue,
  'downloadState' | 'downloadProgress' | 'retryDownload'
> {
  const ctx = useContext(RegionContext);
  if (!ctx) {
    return { downloadState: 'idle', downloadProgress: 0, retryDownload: () => {} };
  }
  return {
    downloadState: ctx.downloadState,
    downloadProgress: ctx.downloadProgress,
    retryDownload: ctx.retryDownload,
  };
}

export function useCaptureModelsReady(): boolean {
  const ctx = useContext(RegionContext);
  return ctx?.captureModelsReady ?? false;
}

export function useRegionContext(): RegionContextValue {
  const ctx = useContext(RegionContext);
  if (!ctx) {
    throw new Error('useRegionContext must be used within RegionProvider');
  }
  return ctx;
}
