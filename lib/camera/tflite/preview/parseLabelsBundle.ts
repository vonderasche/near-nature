/** Label order from `labels.json` bundles under `assets/tflite/preview_models/`. */
export type PreviewLabelsBundle = {
  labels: { index: number; name: string }[];
};

export function labelsFromBundle(bundle: PreviewLabelsBundle): string[] {
  return [...bundle.labels].sort((a, b) => a.index - b.index).map((entry) => entry.name);
}
