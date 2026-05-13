import type { SpeciesStatus } from '@/types';

/** Matches `native_status` enum in `sql/create_detections.sql`. */
export type NativeStatusDb = 'native' | 'invasive' | 'unknown';

export function speciesStatusToNativeColumn(status: SpeciesStatus): NativeStatusDb {
  switch (status) {
    case 'native':
      return 'native';
    case 'invasive':
      return 'invasive';
    case 'non-native':
      return 'unknown';
    case 'unknown':
    default:
      return 'unknown';
  }
}
