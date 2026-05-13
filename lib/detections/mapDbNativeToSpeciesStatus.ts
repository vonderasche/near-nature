import type { SpeciesStatus } from '@/types';

/** Maps `public.detections.native_status` enum values to app `SpeciesStatus`. */
export function mapDbNativeToSpeciesStatus(value: string): SpeciesStatus {
  if (value === 'native') return 'native';
  if (value === 'invasive') return 'invasive';
  return 'unknown';
}
