export type ImageNormalization = {
  mean: [number, number, number];
  std: [number, number, number];
};

export type ModelInputConfig = {
  width: number;
  height: number;
  pixelFormat: 'rgb';
  dataType: 'uint8' | 'float32';
  normalization?: ImageNormalization;
};

type BaseModelConfig = {
  id: string;
  name: string;
  model: number;
  input: ModelInputConfig;
  targetFps: number;
};

export type ClassificationModelConfig = BaseModelConfig & {
  task: 'classification';
  labels: string[];
  topK: number;
  outputType: 'float' | 'quantized';
  confidenceMode?: 'auto' | 'softmax' | 'probability' | 'relative';
  directLabelIndex?: boolean;
  softmaxOutput?: boolean;
  outputActivation?: 'softmax' | 'sigmoid';
  supportsFrameSkipping?: boolean;
  frameSkipInterval?: number;
  frameSkipTargetFps?: number;
  routesToSpecialist?: boolean;
  showInCameraPicker?: boolean;
};

export type TfliteModelConfig = ClassificationModelConfig;

export type RawPrediction = {
  index: number;
  score: number;
};

export type ClassificationPrediction = {
  label: string;
  confidence: number;
};
