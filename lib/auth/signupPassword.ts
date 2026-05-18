export const MIN_SIGNUP_PASSWORD_LENGTH = 8;

export const SIGNUP_PASSWORD_HINT = `At least ${MIN_SIGNUP_PASSWORD_LENGTH} characters`;

export type SignupPasswordValidation = { ok: true } | { ok: false; message: string };

export function validateSignupPassword(password: string): SignupPasswordValidation {
  if (!password) {
    return { ok: false, message: 'Password is required.' };
  }
  if (password.length < MIN_SIGNUP_PASSWORD_LENGTH) {
    return {
      ok: false,
      message: `Password must be at least ${MIN_SIGNUP_PASSWORD_LENGTH} characters.`,
    };
  }
  return { ok: true };
}

export function validateSignupPasswordConfirm(
  password: string,
  confirm: string,
): SignupPasswordValidation {
  const passwordResult = validateSignupPassword(password);
  if (!passwordResult.ok) {
    return passwordResult;
  }
  if (!confirm) {
    return { ok: false, message: 'Confirm your password.' };
  }
  if (password !== confirm) {
    return { ok: false, message: 'Passwords do not match.' };
  }
  return { ok: true };
}
