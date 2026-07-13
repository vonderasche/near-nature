/** Supabase Storage folder under the `region-models` bucket for on-device capture models. */
export const GLOBAL_CAPTURE_STORAGE_ID = 'global';

export const GLOBAL_CAPTURE_BUNDLE_NAME = 'near_nature_v18';

/** Primary capture model — full float32 I/O (works on CPU / XNNPACK). */
export const V18_TFLITE_RELATIVE_PATH = 'v18/tflite/v18.tflite';

/** Optional half-size weights; requires GPU delegate on many devices. */
export const V18_TFLITE_FP16_RELATIVE_PATH = 'v18/tflite/v18_fp16.tflite';

export const V18_LABELS_RELATIVE_PATH = 'v18/tflite/labels.json';

export const V18_MODEL_INFO_RELATIVE_PATH = 'v18/tflite/model_info.json';

/** Legacy v16 paths (kept for sync scripts / reference module). */
export const V16_TFLITE_RELATIVE_PATH = 'v16/tflite/v16.tflite';
export const V16_TFLITE_FP16_RELATIVE_PATH = 'v16/tflite/v16_fp16.tflite';
export const V16_LABELS_RELATIVE_PATH = 'v16/tflite/labels.json';
export const V16_MODEL_INFO_RELATIVE_PATH = 'v16/tflite/model_info.json';
