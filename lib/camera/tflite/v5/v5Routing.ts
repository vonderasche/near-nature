/** Near Nature v5 inference routing (mirrors python/v5/inference/router.py). */

export const V5_KINGDOM_THRESHOLD = 0.6;
export const V5_ROUTER_THRESHOLD = 0.5;
export const V5_SPECIALIST_THRESHOLD = 0.45;
export const V5_NOT_IN_GUIDE = 'Not in our guide yet';

export type V5ProbabilityMap = Record<string, number>;

function argmax(probs: V5ProbabilityMap): { label: string; confidence: number } {
  let label = '';
  let confidence = 0;
  for (const [key, value] of Object.entries(probs)) {
    if (value > confidence) {
      label = key;
      confidence = value;
    }
  }
  return { label, confidence };
}

export function predictionsToProbabilityMap(
  predictions: readonly { label: string; confidence: number }[],
): V5ProbabilityMap {
  return Object.fromEntries(predictions.map((row) => [row.label, row.confidence]));
}

export function routeKingdom(probs: V5ProbabilityMap): 'stop' | typeof V5_NOT_IN_GUIDE | 'plantae' | 'animalia' {
  const { label, confidence } = argmax(probs);
  if (confidence < V5_KINGDOM_THRESHOLD) {
    return V5_NOT_IN_GUIDE;
  }
  if (label === 'not_organism') {
    return 'stop';
  }
  if (label === 'fungi' || label === 'uncertain') {
    return V5_NOT_IN_GUIDE;
  }
  return label as 'plantae' | 'animalia';
}

export function routePlant(probs: V5ProbabilityMap): string {
  const { label, confidence } = argmax(probs);
  if (confidence < V5_ROUTER_THRESHOLD || label === 'not_plant') {
    return V5_NOT_IN_GUIDE;
  }
  return label;
}

export function routeAnimal(probs: V5ProbabilityMap): string {
  const { label, confidence } = argmax(probs);
  if (confidence < V5_ROUTER_THRESHOLD || label === 'not_animal') {
    return V5_NOT_IN_GUIDE;
  }
  return label;
}

export function routeSpecialist(
  probs: V5ProbabilityMap,
): { label: string; confidence: number } {
  const { label, confidence } = argmax(probs);
  if (confidence < V5_SPECIALIST_THRESHOLD) {
    return { label: V5_NOT_IN_GUIDE, confidence };
  }
  return { label, confidence };
}
