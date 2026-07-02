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
  ensureRegionalModels,
  onActiveRegionChanged,
  type EnsureRegionalModelsProgress,
} from '@/lib/region/regionalModelBundle';
import { isRegionReady } from '@/lib/region/regionReadiness';
import {
  refreshRegionalModelBundleReadyCache,
} from '@/services/regionModelDownloadService';

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
  modelBundleReady: boolean,
): ActiveRegion {
  return {
    regionId,
    source,
    isLive: isRegionReady(regionId, modelBundleReady),
    label: regionLabel(regionId),
    displayLabel: regionDisplayLabel(regionId),
  };
}

function progressRatio(progress: EnsureRegionalModelsProgress): number {
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
  const [modelBundleReady, setModelBundleReady] = useState(false);
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

  const runRegionalDownload = useCallback(async (regionId: RegionPackId) => {
    const generation = downloadGenerationRef.current + 1;
    downloadGenerationRef.current = generation;

    setDownloadState('idle');
    setDownloadProgress(0);

    const cachedReady = await refreshRegionalModelBundleReadyCache(regionId);
    if (downloadGenerationRef.current !== generation) return;

    if (cachedReady) {
      setModelBundleReady(true);
      setDownloadState('ready');
      setDownloadProgress(1);
      return;
    }

    setDownloadState('downloading');
    setModelBundleReady(false);

    const ok = await ensureRegionalModels(regionId, {
      onProgress: (progress) => {
        if (downloadGenerationRef.current !== generation) return;
        setDownloadProgress(progressRatio(progress));
      },
    });

    if (downloadGenerationRef.current !== generation) return;

    setModelBundleReady(ok);
    setDownloadState(ok ? 'ready' : 'error');
    setDownloadProgress(ok ? 1 : 0);
  }, []);

  const previousRegionIdRef = useRef<RegionPackId | null>(null);
  useEffect(() => {
    const previous = previousRegionIdRef.current;
    const next = activeRegionId;
    if (previous !== null && previous !== next) {
      onActiveRegionChanged(previous, next);
    }
    previousRegionIdRef.current = next;
    void runRegionalDownload(next);
  }, [activeRegionId, runRegionalDownload]);

  const activeRegion = useMemo(
    () => buildActiveRegion(activeRegionId, manualOverride ? 'manual' : 'auto', modelBundleReady),
    [activeRegionId, manualOverride, modelBundleReady],
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
    void runRegionalDownload(activeRegionId);
  }, [activeRegionId, runRegionalDownload]);

  const ready = storageReady && !homeStateLoading;

  const value = useMemo(
    () => ({
      activeRegion,
      ready,
      downloadState,
      downloadProgress,
      retryDownload,
      setRegionManual,
      clearManualOverride,
    }),
    [activeRegion, ready, downloadState, downloadProgress, retryDownload, setRegionManual, clearManualOverride],
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

export function useRegionContext(): RegionContextValue {
  const ctx = useContext(RegionContext);
  if (!ctx) {
    throw new Error('useRegionContext must be used within RegionProvider');
  }
  return ctx;
}
