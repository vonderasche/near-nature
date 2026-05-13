import { useCallback, useState } from 'react';

import { saveDetection, type SaveDetectionInput } from '@/services/detectionService';

/** Persists the identification to Supabase Storage + `public.detections`. */
export function useSaveDetection() {
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const save = useCallback(async (input: SaveDetectionInput) => {
    setSaving(true);
    setSaveError(null);
    try {
      await saveDetection(input);
      return { ok: true as const };
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Could not save identification.';
      setSaveError(msg);
      return { ok: false as const, message: msg };
    } finally {
      setSaving(false);
    }
  }, []);

  const clearSaveError = useCallback(() => setSaveError(null), []);

  return { save, saving, saveError, clearSaveError };
}

/** Same hook — uploads image + detection row to the database. */
export { useSaveDetection as useDetectionUpload };
