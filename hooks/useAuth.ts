import { useCallback, useState } from 'react';

import { useAuthContext } from '@/context/AuthContext';
import { sendPasswordReset, signIn, signOut, signUp, updatePassword } from '@/services/authService';

function errMessage(err: unknown, fallback: string): string {
  return err instanceof Error ? err.message : fallback;
}

type UseAuthReturn = {
  session: ReturnType<typeof useAuthContext>['session'];
  userId: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isPasswordRecovery: boolean;
  clearPasswordRecovery: () => void;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, fullName: string) => Promise<void>;
  logout: () => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (newPassword: string) => Promise<void>;
  error: string | null;
  clearError: () => void;
};

export function useAuth(): UseAuthReturn {
  const {
    session,
    userId,
    isAuthenticated,
    isLoading,
    isPasswordRecovery,
    clearPasswordRecovery,
  } = useAuthContext();
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => setError(null), []);

  const login = useCallback(async (email: string, password: string) => {
    setError(null);
    try {
      await signIn(email, password);
    } catch (err: unknown) {
      const message = errMessage(err, 'Failed to sign in');
      setError(message);
      throw err;
    }
  }, []);

  const register = useCallback(async (email: string, password: string, fullName: string) => {
    setError(null);
    try {
      await signUp(email, password, fullName);
    } catch (err: unknown) {
      const message = errMessage(err, 'Failed to sign up');
      setError(message);
      throw err;
    }
  }, []);

  const logout = useCallback(async () => {
    setError(null);
    try {
      await signOut();
    } catch (err: unknown) {
      const message = errMessage(err, 'Failed to sign out');
      setError(message);
      throw err;
    }
  }, []);

  const forgotPassword = useCallback(async (email: string) => {
    setError(null);
    try {
      await sendPasswordReset(email);
    } catch (err: unknown) {
      const message = errMessage(err, 'Failed to send reset email');
      setError(message);
      throw err;
    }
  }, []);

  const resetPassword = useCallback(async (newPassword: string) => {
    setError(null);
    try {
      await updatePassword(newPassword);
    } catch (err: unknown) {
      const message = errMessage(err, 'Failed to update password');
      setError(message);
      throw err;
    }
  }, []);

  return {
    session,
    userId,
    isAuthenticated,
    isLoading,
    isPasswordRecovery,
    clearPasswordRecovery,
    login,
    register,
    logout,
    forgotPassword,
    resetPassword,
    error,
    clearError,
  };
}
