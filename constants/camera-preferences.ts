export const CAMERA_PREF_HDR = 'camera.pref.hdr';
export const CAMERA_PREF_STABILIZATION = 'camera.pref.stabilization';
export const CAMERA_PREF_SHUTTER_SOUND = 'camera.pref.shutterSound';
export const CAMERA_PREF_LEVEL = 'camera.pref.level';
export const CAMERA_PREF_LIVE_CLASSIFIER = 'camera.pref.liveClassifier';
export const CAMERA_PREF_PREVIEW_MODE = 'camera.pref.previewMode';

export const DEFAULT_CAMERA_HDR = true;
export const DEFAULT_CAMERA_STABILIZATION = true;
/** Shutter sound on capture until the user turns it off. */
export const DEFAULT_CAMERA_SHUTTER_SOUND = true;
export const DEFAULT_CAMERA_LEVEL = true;
export const DEFAULT_CAMERA_LIVE_CLASSIFIER = false;
/** Live preview AI: scene gate (organism) vs kingdom classifier. */
export const DEFAULT_CAMERA_PREVIEW_MODE = 'scene_gate' as const;
