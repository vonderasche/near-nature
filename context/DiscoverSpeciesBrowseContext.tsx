import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  type ReactNode,
} from 'react';

import { usePersistedPreference } from '@/hooks/usePersistedPreference';
import {
  DEFAULT_DISCOVER_SPECIES_FILTER,
  DISCOVER_ANIMAL_FILTER_STORAGE_KEY,
  DISCOVER_PLANT_FILTER_STORAGE_KEY,
  parseDiscoverSpeciesFilter,
  serializeDiscoverSpeciesFilter,
  type DiscoverSpeciesSubcategoryFilter,
} from '@/lib/discover/discoverSpeciesFilter';
import {
  DEFAULT_DISCOVER_SPECIES_SORT,
  DISCOVER_ANIMAL_SORT_STORAGE_KEY,
  DISCOVER_PLANT_SORT_STORAGE_KEY,
  parseDiscoverSpeciesSortMode,
  type DiscoverSpeciesSortMode,
} from '@/lib/discover/discoverSpeciesSort';
import type { DiscoverSpeciesKind } from '@/types/discover-species';

type DiscoverSpeciesBrowseContextValue = {
  getFilter: (kind: DiscoverSpeciesKind) => DiscoverSpeciesSubcategoryFilter;
  setFilter: (kind: DiscoverSpeciesKind, filter: DiscoverSpeciesSubcategoryFilter) => void;
  getSort: (kind: DiscoverSpeciesKind) => DiscoverSpeciesSortMode;
  setSort: (kind: DiscoverSpeciesKind, mode: DiscoverSpeciesSortMode) => void;
};

const DiscoverSpeciesBrowseContext = createContext<DiscoverSpeciesBrowseContextValue | null>(null);

export function DiscoverSpeciesBrowseProvider({ children }: { children: ReactNode }) {
  const { value: plantFilterRaw, setValue: setPlantFilterRaw } = usePersistedPreference<string>(
    DISCOVER_PLANT_FILTER_STORAGE_KEY,
    (raw) => serializeDiscoverSpeciesFilter(parseDiscoverSpeciesFilter(raw)),
    serializeDiscoverSpeciesFilter(DEFAULT_DISCOVER_SPECIES_FILTER),
  );
  const { value: animalFilterRaw, setValue: setAnimalFilterRaw } = usePersistedPreference<string>(
    DISCOVER_ANIMAL_FILTER_STORAGE_KEY,
    (raw) => serializeDiscoverSpeciesFilter(parseDiscoverSpeciesFilter(raw)),
    serializeDiscoverSpeciesFilter(DEFAULT_DISCOVER_SPECIES_FILTER),
  );
  const { value: plantSort, setValue: setPlantSort } = usePersistedPreference<DiscoverSpeciesSortMode>(
    DISCOVER_PLANT_SORT_STORAGE_KEY,
    parseDiscoverSpeciesSortMode,
    DEFAULT_DISCOVER_SPECIES_SORT,
  );
  const { value: animalSort, setValue: setAnimalSort } = usePersistedPreference<DiscoverSpeciesSortMode>(
    DISCOVER_ANIMAL_SORT_STORAGE_KEY,
    parseDiscoverSpeciesSortMode,
    DEFAULT_DISCOVER_SPECIES_SORT,
  );

  const plantFilter = useMemo(() => parseDiscoverSpeciesFilter(plantFilterRaw), [plantFilterRaw]);
  const animalFilter = useMemo(() => parseDiscoverSpeciesFilter(animalFilterRaw), [animalFilterRaw]);

  const getFilter = useCallback(
    (kind: DiscoverSpeciesKind) => (kind === 'plant' ? plantFilter : animalFilter),
    [animalFilter, plantFilter],
  );

  const setFilter = useCallback(
    (kind: DiscoverSpeciesKind, filter: DiscoverSpeciesSubcategoryFilter) => {
      const serialized = serializeDiscoverSpeciesFilter(filter);
      if (kind === 'plant') {
        setPlantFilterRaw(serialized);
      } else {
        setAnimalFilterRaw(serialized);
      }
    },
    [setAnimalFilterRaw, setPlantFilterRaw],
  );

  const getSort = useCallback(
    (kind: DiscoverSpeciesKind) => (kind === 'plant' ? plantSort : animalSort),
    [animalSort, plantSort],
  );

  const setSort = useCallback(
    (kind: DiscoverSpeciesKind, mode: DiscoverSpeciesSortMode) => {
      if (kind === 'plant') {
        setPlantSort(mode);
      } else {
        setAnimalSort(mode);
      }
    },
    [setAnimalSort, setPlantSort],
  );

  const value = useMemo(
    () => ({ getFilter, setFilter, getSort, setSort }),
    [getFilter, getSort, setFilter, setSort],
  );

  return (
    <DiscoverSpeciesBrowseContext.Provider value={value}>{children}</DiscoverSpeciesBrowseContext.Provider>
  );
}

export function useDiscoverSpeciesBrowse() {
  const context = useContext(DiscoverSpeciesBrowseContext);
  if (!context) {
    throw new Error('useDiscoverSpeciesBrowse must be used within DiscoverSpeciesBrowseProvider');
  }
  return context;
}
