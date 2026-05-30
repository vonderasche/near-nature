import type { MobileNetPredictionScore } from '@/lib/camera/mobilenet/parseMobileNetOutput';
import { parseMobileNetTop3 } from '@/lib/camera/mobilenet/parseMobileNetOutput';

export type BirdsRollupManifest = {
  strategy: string;
  speciesCount: number;
  genusCount: number;
  speciesToGenus: number[];
};

function softmax(logits: Float32Array): Float32Array {
  let max = logits[0] ?? 0;
  for (let i = 1; i < logits.length; i++) {
    const value = logits[i] ?? 0;
    if (value > max) max = value;
  }
  const probs = new Float32Array(logits.length);
  let sum = 0;
  for (let i = 0; i < logits.length; i++) {
    const p = Math.exp((logits[i] ?? 0) - max);
    probs[i] = p;
    sum += p;
  }
  for (let i = 0; i < probs.length; i++) {
    probs[i] /= sum || 1;
  }
  return probs;
}

/** Sums species softmax probabilities into genus buckets, returns top-3 genera. */
export function rollupSpeciesScoresToGenusTop3(
  speciesOutput: ArrayBuffer,
  rollup: BirdsRollupManifest,
): MobileNetPredictionScore[] {
  const logits = new Float32Array(speciesOutput);
  const speciesProbs = softmax(logits);
  const genusScores = new Float32Array(rollup.genusCount);

  for (let speciesIndex = 0; speciesIndex < rollup.speciesCount; speciesIndex++) {
    const genusIndex = rollup.speciesToGenus[speciesIndex];
    if (genusIndex == null || genusIndex < 0 || genusIndex >= rollup.genusCount) continue;
    genusScores[genusIndex] = (genusScores[genusIndex] ?? 0) + (speciesProbs[speciesIndex] ?? 0);
  }

  return parseMobileNetTop3(genusScores.buffer);
}
