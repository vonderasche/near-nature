import { useCallback, useEffect, useState } from 'react';

import {
  hasSeenFirstLoginWelcome,
  markFirstLoginWelcomeSeen,
} from '@/lib/welcome/firstLoginWelcomeStorage';

type UseFirstLoginWelcomeOptions = {
  userId: string | null;
  enabled: boolean;
};

export function useFirstLoginWelcome({ userId, enabled }: UseFirstLoginWelcomeOptions) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let cancelled = false;

    if (!enabled || !userId) {
      setVisible(false);
      return () => {
        cancelled = true;
      };
    }

    void (async () => {
      const seen = await hasSeenFirstLoginWelcome(userId);
      if (!cancelled) setVisible(!seen);
    })();

    return () => {
      cancelled = true;
    };
  }, [enabled, userId]);

  const dismiss = useCallback(async () => {
    setVisible(false);
    if (userId) {
      await markFirstLoginWelcomeSeen(userId);
    }
  }, [userId]);

  return { visible, dismiss };
}
