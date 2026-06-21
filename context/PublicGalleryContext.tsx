import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';

import type { GalleryCategoryFilter } from '@/lib/detections/filterDetectionGalleryItems';

type PublicGalleryContextValue = {
  categoryFilter: GalleryCategoryFilter;
  setCategoryFilter: (value: GalleryCategoryFilter) => void;
};

const PublicGalleryContext = createContext<PublicGalleryContextValue | null>(null);

export function PublicGalleryProvider({ children }: { children: ReactNode }) {
  const [categoryFilter, setCategoryFilter] = useState<GalleryCategoryFilter>({ kind: 'all' });

  const contextValue = useMemo(
    () => ({ categoryFilter, setCategoryFilter }),
    [categoryFilter, setCategoryFilter],
  );

  return (
    <PublicGalleryContext.Provider value={contextValue}>{children}</PublicGalleryContext.Provider>
  );
}

export function usePublicGalleryPrefs(): PublicGalleryContextValue {
  const context = useContext(PublicGalleryContext);
  if (!context) {
    throw new Error('usePublicGalleryPrefs must be used within PublicGalleryProvider');
  }
  return context;
}
