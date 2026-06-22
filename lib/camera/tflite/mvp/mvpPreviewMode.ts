export type MvpPreviewMode = 'scene_gate' | 'kingdom';

export function parseMvpPreviewMode(raw: string | null): MvpPreviewMode {
  return raw === 'kingdom' ? 'kingdom' : 'scene_gate';
}

export function nextMvpPreviewMode(current: MvpPreviewMode): MvpPreviewMode {
  return current === 'scene_gate' ? 'kingdom' : 'scene_gate';
}

export function mvpPreviewModeCaption(mode: MvpPreviewMode): string {
  return mode === 'kingdom' ? 'Kingdom' : 'Scene';
}
