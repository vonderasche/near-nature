export type LiveClassifierModelState = 'loading' | 'loaded' | 'error' | 'unavailable';

export type LiveClassifierPrediction = {
  label: string;
  confidence: number;
  classIndex: number;
  /** Secondary line — confidence %, hints, or "hold steady" guidance. */
  detail?: string;
};
