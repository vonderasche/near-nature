import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';

import { usePersistedPreference } from '@/hooks/usePersistedPreference';
import type { GalleryCategoryFilter } from '@/lib/detections/filterDetectionGalleryItems';

const DEFAULT_FILTER: GalleryCategoryFilter = { kind: 'all' };

function parseCategoryFilter(raw: string | null): GalleryCategoryFilter {
  if (!raw) return DEFAULT_FILTER;
  try {
    const parsed = JSON.parse(raw) as GalleryCategoryFilter;
    if (parsed && typeof parsed === 'object' && 'kind' in parsed) {
      return parsed;
    }
  } catch {
    /* ignore */
  }
  return DEFAULT_FILTER;
}

type GalleryCategoryFilterContextValue = {
  categoryFilter: GalleryCategoryFilter;
  setCategoryFilter: (value: GalleryCategoryFilter) => void;
};

const GalleryCategoryFilterContext = createContext<GalleryCategoryFilterContextValue | null>(null);

type ProviderProps = {
  children: ReactNode;
  /** When set, filter choice persists across sessions (own profile). */
  persistKey?: string;
};

function SessionGalleryCategoryFilterProvider({ children }: { children: ReactNode }) {
  const [categoryFilter, setCategoryFilter] = useState<GalleryCategoryFilter>(DEFAULT_FILTER);
  const value = useMemo(
    () => ({ categoryFilter, setCategoryFilter }),
    [categoryFilter, setCategoryFilter],
  );
  return (
    <GalleryCategoryFilterContext.Provider value={value}>{children}</GalleryCategoryFilterContext.Provider>
  );
}

function PersistedGalleryCategoryFilterProvider({
  children,
  persistKey,
}: {
  children: ReactNode;
  persistKey: string;
}) {
  const { value: categoryFilter, setValue: setCategoryFilter } = usePersistedPreference(
    persistKey,
    parseCategoryFilter,
    DEFAULT_FILTER,
  );
  const contextValue = useMemo(
    () => ({ categoryFilter, setCategoryFilter }),
    [categoryFilter, setCategoryFilter],
  );
  return (
    <GalleryCategoryFilterContext.Provider value={contextValue}>
      {children}
    </GalleryCategoryFilterContext.Provider>
  );
}

export function GalleryCategoryFilterProvider({ children, persistKey }: ProviderProps) {
  if (persistKey) {
    return (
      <PersistedGalleryCategoryFilterProvider persistKey={persistKey}>
        {children}
      </PersistedGalleryCategoryFilterProvider>
    );
  }
  return <SessionGalleryCategoryFilterProvider>{children}</SessionGalleryCategoryFilterProvider>;
}

export function useGalleryCategoryFilter(): GalleryCategoryFilterContextValue {
  const context = useContext(GalleryCategoryFilterContext);
  if (!context) {
    throw new Error('useGalleryCategoryFilter must be used within GalleryCategoryFilterProvider');
  }
  return context;
}

/** Storage key for the signed-in user's gallery category filter. */
export const PROFILE_GALLERY_FILTER_STORAGE_KEY = 'near_nature:profile_gallery_category_filter';
