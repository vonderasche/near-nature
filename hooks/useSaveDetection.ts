import { useCallback, useState } from 'react';

import { errorMessageFromUnknown } from '@/lib/errors/errorMessage';
import { saveDetection, type SaveDetectionInput, type SaveDetectionResult } from '@/services/detectionService';

const SAVE_FAILED_FALLBACK = 'Could not save identification.';

export type SaveDetectionSuccess = {
  ok: true;
  result: SaveDetectionResult;
};

export type SaveDetectionFailure = {
  ok: false;
  message: string;
};

export type SaveDetectionOutcome = SaveDetectionSuccess | SaveDetectionFailure;

/** Persists the identification to Supabase Storage + `public.detections`. */
export function useSaveDetection() {
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const save = useCallback(async (input: SaveDetectionInput): Promise<SaveDetectionOutcome> => {
    setSaving(true);
    setSaveError(null);
    try {
      const result = await saveDetection(input);
      return { ok: true, result };
    } catch (e) {
      const msg = errorMessageFromUnknown(e, SAVE_FAILED_FALLBACK);
      setSaveError(msg);
      return { ok: false, message: msg };
    } finally {
      setSaving(false);
    }
  }, []);

  const clearSaveError = useCallback(() => setSaveError(null), []);

  /** Fire-and-forget upload; does not toggle {@link saving} or block the UI. */
  const saveInBackground = useCallback(
    (input: SaveDetectionInput, onComplete?: (result: SaveDetectionOutcome) => void) => {
      void (async () => {
        try {
          const result = await saveDetection(input);
          onComplete?.({ ok: true, result });
        } catch (e) {
          const message = errorMessageFromUnknown(e, SAVE_FAILED_FALLBACK);
          onComplete?.({ ok: false, message });
        }
      })();
    },
    [],
  );

  return { save, saveInBackground, saving, saveError, clearSaveError };
}

/** Same hook — uploads image + detection row to the database. */
export { useSaveDetection as useDetectionUpload };
