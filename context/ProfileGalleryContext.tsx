import { createContext, useContext, useMemo, type ReactNode } from 'react';

import type { GalleryCategoryFilter } from '@/lib/detections/filterDetectionGalleryItems';
import { usePersistedPreference } from '@/hooks/usePersistedPreference';

const STORAGE_KEY = 'near_nature:profile_gallery_category_filter';

function parseCategoryFilter(raw: string | null): GalleryCategoryFilter {
  if (!raw) return { kind: 'all' };
  try {
    const parsed = JSON.parse(raw) as GalleryCategoryFilter;
    if (parsed && typeof parsed === 'object' && 'kind' in parsed) {
      return parsed;
    }
  } catch {
    /* ignore */
  }
  return { kind: 'all' };
}

type ProfileGalleryContextValue = {
  categoryFilter: GalleryCategoryFilter;
  setCategoryFilter: (value: GalleryCategoryFilter) => void;
};

const ProfileGalleryContext = createContext<ProfileGalleryContextValue | null>(null);

export function ProfileGalleryProvider({ children }: { children: ReactNode }) {
  const { value: categoryFilter, setValue: setCategoryFilter } = usePersistedPreference(
    STORAGE_KEY,
    parseCategoryFilter,
    { kind: 'all' } as GalleryCategoryFilter,
  );

  const contextValue = useMemo(
    () => ({ categoryFilter, setCategoryFilter }),
    [categoryFilter, setCategoryFilter],
  );

  return (
    <ProfileGalleryContext.Provider value={contextValue}>{children}</ProfileGalleryContext.Provider>
  );
}

export function useProfileGalleryPrefs(): ProfileGalleryContextValue {
  const context = useContext(ProfileGalleryContext);
  if (!context) {
    throw new Error('useProfileGalleryPrefs must be used within ProfileGalleryProvider');
  }
  return context;
}
