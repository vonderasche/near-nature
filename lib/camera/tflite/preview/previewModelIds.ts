/** Live camera preview model ids — add entries in `previewModelRegistry.ts`. */
export type PreviewModelId = 'kingdom_global' | 'kingdom';

export const DEFAULT_PREVIEW_MODEL_ID: PreviewModelId = 'kingdom_global';

/** How raw logits are interpreted in the overlay mapper. */
export type PreviewModelKind = 'kingdom_global' | 'kingdom';
