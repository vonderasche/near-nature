/** Live camera preview model ids — add entries in `previewModelRegistry.ts`. */
export type PreviewModelId =
  | 'scene_gate'
  | 'kingdom'
  | 'routing_preview_v1'
  | 'efficientnet_b0_imagenet'
  | 'efficientnet_lite0_imagenet'
  | 'efficientnet_lite2_imagenet'
  | 'mobilenet_v2_imagenet';

export const DEFAULT_PREVIEW_MODEL_ID: PreviewModelId = 'scene_gate';

/** How raw logits are interpreted in the overlay mapper. */
export type PreviewModelKind = 'scene_gate' | 'kingdom' | 'plain';
