import { useCallback, useState } from 'react';

import { normalizeUsStateCode, type UsStateCode } from '@/constants/us-states';
import type { UpdateUserResult } from '@/hooks/useUser';
import type { UpdateUserPayload } from '@/services/userService';

type UpdateFn = (payload: UpdateUserPayload) => Promise<UpdateUserResult>;

export function useStateSave(update: UpdateFn) {
  const [saving, setSaving] = useState(false);

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

  return { saveState, saving };
}
