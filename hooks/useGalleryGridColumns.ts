import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useState } from 'react';

import {
  DEFAULT_GALLERY_GRID_COLUMNS,
  GALLERY_GRID_COLUMNS_STORAGE_KEY,
  type GalleryGridColumns,
  parseGalleryGridColumns,
} from '@/lib/detections/galleryGridColumns';

export function useGalleryGridColumns() {
  const [columns, setColumns] = useState<GalleryGridColumns>(DEFAULT_GALLERY_GRID_COLUMNS);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void AsyncStorage.getItem(GALLERY_GRID_COLUMNS_STORAGE_KEY).then((raw) => {
      if (!cancelled) {
        setColumns(parseGalleryGridColumns(raw));
        setReady(true);
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const setColumnCount = useCallback((next: GalleryGridColumns) => {
    setColumns(next);
    void AsyncStorage.setItem(GALLERY_GRID_COLUMNS_STORAGE_KEY, String(next));
  }, []);

  return { columns, setColumnCount, ready };
}
