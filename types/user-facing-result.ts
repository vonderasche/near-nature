const DEFAULT_FAILURE = 'Something went wrong.';

export type UserFacingOk = { ok: true };
export type UserFacingErr = { ok: false; message: string };
export type UserFacingResult = UserFacingOk | UserFacingErr;

export function userFacingOk(): UserFacingOk {
  return { ok: true };
}

/**
 * Failure shown to the user. Trims `rawMessage`; if empty, uses `fallback`, then {@link DEFAULT_FAILURE}.
 */
export function userFacingErr(rawMessage: string, fallback: string = DEFAULT_FAILURE): UserFacingErr {
  const primary = rawMessage.trim();
  if (primary.length > 0) {
    return { ok: false, message: primary };
  }
  const fb = fallback.trim();
  return { ok: false, message: fb.length > 0 ? fb : DEFAULT_FAILURE };
}

export function userFacingFromUnknown(error: unknown, fallback: string = DEFAULT_FAILURE): UserFacingErr {
  if (error instanceof Error) {
    return userFacingErr(error.message, fallback);
  }
  return userFacingErr('', fallback);
}
