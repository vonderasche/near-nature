export type ModelLabelsJson = {
  labels: { index: number; name: string }[];
};

/** Builds a dense label array indexed by class id. */
export function buildLabelLookup(json: ModelLabelsJson): string[] {
  const maxIndex = json.labels.reduce((max, row) => Math.max(max, row.index), -1);
  const lookup: string[] = [];
  for (const row of json.labels) {
    lookup[row.index] = row.name;
  }
  for (let i = 0; i <= maxIndex; i++) {
    if (!lookup[i]) lookup[i] = `Class ${i}`;
  }
  return lookup;
}

export function getLabelAtIndex(lookup: readonly string[], classIndex: number): string {
  return lookup[classIndex] ?? `Class ${classIndex}`;
}
