const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export type SignupEmailValidation = { ok: true } | { ok: false; message: string };

export function validateSignupEmail(email: string): SignupEmailValidation {
  const trimmed = email.trim();
  if (!trimmed) {
    return { ok: false, message: 'Email is required.' };
  }
  if (trimmed.length < 5 || !trimmed.includes('@')) {
    return { ok: false, message: 'Enter a valid email address.' };
  }
  if (!EMAIL_PATTERN.test(trimmed)) {
    return { ok: false, message: 'Enter a valid email address.' };
  }
  return { ok: true };
}

export function isEmailReadyForAvailabilityCheck(email: string): boolean {
  return validateSignupEmail(email).ok;
}
