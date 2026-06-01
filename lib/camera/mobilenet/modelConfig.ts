// Current on-device pipeline uses two different input sizes:
// - EfficientNetB0 live preview: 224×224
// - MobileViT routing: 256×256
// - EfficientNetB0 specialists: 224×224
export const LIVE_PREVIEW_INPUT_SIZE = 224;
export const ROUTING_MODEL_INPUT_SIZE = 256;
export const SPECIALIST_MODEL_INPUT_SIZE = 224;

export const LIVE_PREVIEW_INFERENCE_FPS = 2;

export const MOBILENET_PREVIEW_IMAGENET_MEAN = [0.485, 0.456, 0.406] as const;
export const MOBILENET_PREVIEW_IMAGENET_STD = [0.229, 0.224, 0.225] as const;
