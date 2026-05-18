import { useEffect, useMemo, useState } from 'react';

import {
  isEmailAlreadyRegistered,
  isEmailReadyForAvailabilityCheck,
  isUsernameAlreadyTaken,
  isUsernameReadyForAvailabilityCheck,
} from '@/lib/auth/checkSignupAvailability';
import { validateUsername } from '@/lib/auth/validateUsername';

const DEBOUNCE_MS = 450;

export const SIGNUP_EMAIL_TAKEN_MESSAGE =
  'An account with this email already exists. Try Log in instead.';
export const SIGNUP_USERNAME_TAKEN_MESSAGE =
  'This username is already taken. Usernames are not case-sensitive — ExampleUserName and exampleusername are the same.';

export function useSignupAvailability(email: string, username: string) {
  const [emailTaken, setEmailTaken] = useState(false);
  const [usernameTaken, setUsernameTaken] = useState(false);
  const [emailChecking, setEmailChecking] = useState(false);
  const [usernameChecking, setUsernameChecking] = useState(false);
  const [checkError, setCheckError] = useState<string | null>(null);

  const usernameValidation = useMemo(() => validateUsername(username), [username]);
  const usernameInvalid = username.length > 0 && !usernameValidation.ok;

  useEffect(() => {
    if (!isEmailReadyForAvailabilityCheck(email)) {
      setEmailTaken(false);
      setEmailChecking(false);
      return;
    }

    let cancelled = false;
    setEmailChecking(true);
    setCheckError(null);

    const timer = setTimeout(() => {
      void (async () => {
        try {
          const taken = await isEmailAlreadyRegistered(email);
          if (!cancelled) setEmailTaken(taken);
        } catch {
          if (!cancelled) setCheckError('Could not check email. Try again.');
        } finally {
          if (!cancelled) setEmailChecking(false);
        }
      })();
    }, DEBOUNCE_MS);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [email]);

  useEffect(() => {
    if (!isUsernameReadyForAvailabilityCheck(username)) {
      setUsernameTaken(false);
      setUsernameChecking(false);
      return;
    }

    let cancelled = false;
    setUsernameChecking(true);
    setCheckError(null);

    const timer = setTimeout(() => {
      void (async () => {
        try {
          const taken = await isUsernameAlreadyTaken(username);
          if (!cancelled) setUsernameTaken(taken);
        } catch {
          if (!cancelled) setCheckError('Could not check username. Try again.');
        } finally {
          if (!cancelled) setUsernameChecking(false);
        }
      })();
    }, DEBOUNCE_MS);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [username]);

  const emailMessage = emailChecking
    ? 'Checking email…'
    : emailTaken
      ? SIGNUP_EMAIL_TAKEN_MESSAGE
      : null;

  const usernameMessage = usernameInvalid
    ? usernameValidation.message
    : usernameChecking
      ? 'Checking username…'
      : usernameTaken
        ? SIGNUP_USERNAME_TAKEN_MESSAGE
        : null;

  const usernameBlocked = usernameInvalid || usernameTaken;
  const availabilityBlocked = emailTaken || usernameBlocked;
  const availabilityChecking =
    emailChecking || (usernameChecking && !usernameInvalid);

  return {
    emailTaken,
    usernameTaken,
    usernameInvalid,
    emailMessage,
    usernameMessage,
    checkError,
    availabilityBlocked,
    availabilityChecking,
  };
}
