import { useCallback, useState } from 'react';

import { normalizeUsStateCode, type UsStateCode } from '@/constants/us-states';
import type { UpdateUserResult } from '@/hooks/useUser';
import type { UpdateUserPayload } from '@/services/userService';

type UpdateFn = (payload: UpdateUserPayload) => Promise<UpdateUserResult>;

/** Shared loading wrapper for profile field updates (motto, home state, etc.). */
export function useProfileFieldSave(update: UpdateFn) {
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

  const saveState = useCallback(
    async (stateCode: UsStateCode | ''): Promise<UpdateUserResult> => {
      const normalized = normalizeUsStateCode(stateCode);
      if (!normalized) {
        return { ok: false, message: 'Select a valid US state.' };
      }
      setSaving(true);
      try {
        return await update({ state: normalized });
      } finally {
        setSaving(false);
      }
    },
    [update],
  );

  return { saveMotto, saveState, saving };
}
