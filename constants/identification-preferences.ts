/** On-device capture identification: regional vs global model pack. */
export const CAPTURE_MODE_PREF = 'identification.pref.captureMode';

export type CaptureMode = 'regional' | 'global';

/** Default uses regional specialists when the user's region pack is downloaded. */
export const DEFAULT_CAPTURE_MODE: CaptureMode = 'regional';

export function parseCaptureMode(raw: string | null | undefined): CaptureMode {
  return raw === 'global' ? 'global' : DEFAULT_CAPTURE_MODE;
}
