import type { ClassificationResult } from '@/types';

export type GenusPrediction = {
  genus: string;
  confidence: number;
  classIndex: number;
};

export type PreviewPrediction = {
  label: string;
  confidence: number;
  classIndex: number;
};

export type TfliteIdentificationMeta = {
  previewTop: PreviewPrediction[];
  routedPreviewLabel: string;
  specialistId: string | null;
  specialistDisplayName: string | null;
  genusTop: GenusPrediction[];
  usedSpecialist: boolean;
  notice: string | null;
};

export type TfliteIdentificationResult = {
  classifications: ClassificationResult[];
  meta: TfliteIdentificationMeta;
};
