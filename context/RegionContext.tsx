import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import { ACTIVE_REGION_OVERRIDE_STORAGE_KEY } from '@/constants/region-storage';
import {
  DEFAULT_REGION_PACK_ID,
  isRegionLive,
  isRegionPackId,
  regionDisplayLabel,
  regionLabel,
  resolveRegionFromState,
  type RegionPackId,
} from '@/constants/regions';
import { useUserHomeState } from '@/hooks/useUserHomeState';

export type RegionSource = 'auto' | 'manual';

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
  setRegionManual: (regionId: RegionPackId) => void;
  clearManualOverride: () => void;
};

const RegionContext = createContext<RegionContextValue | null>(null);

function buildActiveRegion(regionId: RegionPackId, source: RegionSource): ActiveRegion {
  return {
    regionId,
    source,
    isLive: isRegionLive(regionId),
    label: regionLabel(regionId),
    displayLabel: regionDisplayLabel(regionId),
  };
}

export function RegionProvider({ children }: { children: ReactNode }) {
  const { stateCode, loading: homeStateLoading } = useUserHomeState();
  const [manualOverride, setManualOverride] = useState<RegionPackId | null>(null);
  const [storageReady, setStorageReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void AsyncStorage.getItem(ACTIVE_REGION_OVERRIDE_STORAGE_KEY).then((raw) => {
      if (cancelled) return;
      setManualOverride(isRegionPackId(raw) ? raw : null);
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

  const activeRegion = useMemo(() => {
    if (manualOverride) {
      return buildActiveRegion(manualOverride, 'manual');
    }
    return buildActiveRegion(autoRegionId, 'auto');
  }, [autoRegionId, manualOverride]);

  const setRegionManual = useCallback((regionId: RegionPackId) => {
    setManualOverride(regionId);
    void AsyncStorage.setItem(ACTIVE_REGION_OVERRIDE_STORAGE_KEY, regionId);
  }, []);

  const clearManualOverride = useCallback(() => {
    setManualOverride(null);
    void AsyncStorage.removeItem(ACTIVE_REGION_OVERRIDE_STORAGE_KEY);
  }, []);

  const ready = storageReady && !homeStateLoading;

  const value = useMemo(
    () => ({
      activeRegion,
      ready,
      setRegionManual,
      clearManualOverride,
    }),
    [activeRegion, ready, setRegionManual, clearManualOverride],
  );

  return <RegionContext.Provider value={value}>{children}</RegionContext.Provider>;
}

export function useActiveRegion(): ActiveRegion {
  const ctx = useContext(RegionContext);
  if (!ctx) {
    return buildActiveRegion(DEFAULT_REGION_PACK_ID, 'auto');
  }
  return ctx.activeRegion;
}

export function useRegionContext(): RegionContextValue {
  const ctx = useContext(RegionContext);
  if (!ctx) {
    throw new Error('useRegionContext must be used within RegionProvider');
  }
  return ctx;
}
