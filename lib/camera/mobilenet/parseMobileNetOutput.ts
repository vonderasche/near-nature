export type MobileNetPredictionScore = {
  classIndex: number;
  confidence: number;
};

const TOP_K = 3;

function insertTopPrediction(
  top: MobileNetPredictionScore[],
  candidate: MobileNetPredictionScore,
): void {
  'worklet';
  for (let i = 0; i < TOP_K; i++) {
    const existing = top[i];
    if (!existing || candidate.confidence > existing.confidence) {
      top.splice(i, 0, candidate);
      top.length = Math.min(top.length, TOP_K);
      return;
    }
  }
}

/** Returns top-3 predictions from float logits/probabilities or quantized classifier output. */
export function parseMobileNetTop3(output: ArrayBuffer): MobileNetPredictionScore[] {
  'worklet';
  const byteLength = output.byteLength;
  const top: MobileNetPredictionScore[] = [];

  if (byteLength >= 4 && byteLength % 4 === 0 && byteLength / 4 <= 1001) {
    const floats = new Float32Array(output);
    let maxLogit = floats[0] ?? 0;
    for (let i = 1; i < floats.length; i++) {
      const value = floats[i] ?? 0;
      if (value > maxLogit) maxLogit = value;
    }

    let sumExp = 0;
    for (let i = 0; i < floats.length; i++) {
      sumExp += Math.exp((floats[i] ?? 0) - maxLogit);
    }

    for (let i = 0; i < floats.length; i++) {
      const confidence = Math.exp((floats[i] ?? 0) - maxLogit) / sumExp;
      insertTopPrediction(top, { classIndex: i, confidence });
    }
    return top;
  }

  const bytes = new Uint8Array(output);
  for (let i = 0; i < bytes.length; i++) {
    insertTopPrediction(top, {
      classIndex: i,
      confidence: (bytes[i] ?? 0) / 255,
    });
  }
  return top;
}
