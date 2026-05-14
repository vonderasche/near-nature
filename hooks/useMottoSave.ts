import { useCallback, useState } from 'react';

import type { UpdateUserResult } from '@/hooks/useUser';
import type { UpdateUserPayload } from '@/services/userService';

type UpdateFn = (payload: UpdateUserPayload) => Promise<UpdateUserResult>;

/**
 * Wraps user profile update with loading state for motto saves from the edit modal.
 */
export function useMottoSave(update: UpdateFn) {
  const [saving, setSaving] = useState(false);

  const saveMotto = useCallback(
    async (motto: string | null): Promise<UpdateUserResult> => {
      setSaving(true);
      try {
        const payload: UpdateUserPayload = {
          motto: motto && motto.trim().length > 0 ? motto.trim() : null,
        };
        return await update(payload);
      } finally {
        setSaving(false);
      }
    },
    [update],
  );

  return { saveMotto, saving };
}
