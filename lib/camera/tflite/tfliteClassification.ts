import type { ClassificationPrediction, RawPrediction } from '@/lib/camera/tflite/modelTypes';

export function indexToLabel(
  index: number,
  labels: string[],
  directLabelIndex?: boolean,
): string {
  if (directLabelIndex) {
    return labels[index] ?? `class-${index}`;
  }

  if (index === 0) {
    return 'background';
  }

  const labelIndex = index - 1;
  return labels[labelIndex] ?? `class-${index}`;
}

function softmaxPredictions(
  raw: RawPrediction[],
  labels: string[],
  directLabelIndex?: boolean,
): ClassificationPrediction[] {
  const maxLogit = Math.max(...raw.map((item) => item.score));
  const expScores = raw.map((item) => Math.exp(item.score - maxLogit));
  const sum = expScores.reduce((total, value) => total + value, 0);

  return raw.map((item, index) => ({
    label: indexToLabel(item.index, labels, directLabelIndex),
    confidence: expScores[index] / sum,
  }));
}

function probabilityPredictions(
  raw: RawPrediction[],
  labels: string[],
  directLabelIndex?: boolean,
): ClassificationPrediction[] {
  return raw.map((item) => ({
    label: indexToLabel(item.index, labels, directLabelIndex),
    confidence: Math.min(1, Math.max(0, item.score)),
  }));
}

function relativePredictions(
  raw: RawPrediction[],
  labels: string[],
  directLabelIndex?: boolean,
): ClassificationPrediction[] {
  const maxScore = Math.max(...raw.map((item) => item.score), 1);

  return raw.map((item) => ({
    label: indexToLabel(item.index, labels, directLabelIndex),
    confidence: item.score / maxScore,
  }));
}

function looksLikeProbabilities(raw: RawPrediction[]): boolean {
  const sum = raw.reduce((total, item) => total + item.score, 0);
  return (
    raw.length > 0 &&
    raw.every((item) => item.score >= 0 && item.score <= 1) &&
    sum > 0.98 &&
    sum < 1.02
  );
}

export function mapRawPredictions(
  raw: RawPrediction[],
  labels: string[],
  options?: {
    confidenceMode?: 'auto' | 'softmax' | 'probability' | 'relative';
    directLabelIndex?: boolean;
    softmaxOutput?: boolean;
    topK?: number;
  },
): ClassificationPrediction[] {
  const mode =
    options?.confidenceMode ?? (options?.softmaxOutput ? 'softmax' : 'relative');

  let predictions: ClassificationPrediction[];
  if (mode === 'auto') {
    predictions = looksLikeProbabilities(raw)
      ? probabilityPredictions(raw, labels, options?.directLabelIndex)
      : softmaxPredictions(raw, labels, options?.directLabelIndex);
  } else if (mode === 'softmax') {
    predictions = softmaxPredictions(raw, labels, options?.directLabelIndex);
  } else if (mode === 'probability') {
    predictions = probabilityPredictions(raw, labels, options?.directLabelIndex);
  } else {
    predictions = relativePredictions(raw, labels, options?.directLabelIndex);
  }

  return predictions
    .sort((a, b) => b.confidence - a.confidence)
    .slice(0, options?.topK ?? predictions.length);
}
