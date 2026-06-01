export type MobileNetPredictionScore = {
  classIndex: number;
  confidence: number;
};

function insertTopPrediction(
  top: MobileNetPredictionScore[],
  candidate: MobileNetPredictionScore,
  k: number,
): void {
  'worklet';
  for (let i = 0; i < k; i++) {
    const existing = top[i];
    if (!existing || candidate.confidence > existing.confidence) {
      top.splice(i, 0, candidate);
      top.length = Math.min(top.length, k);
      return;
    }
  }
}

/** Returns top-K predictions from float logits/probabilities or quantized classifier output. */
export function parseMobileNetTopK(
  output: ArrayBuffer,
  k: number,
  options?: { forceFloat?: boolean },
): MobileNetPredictionScore[] {
  'worklet';
  const limit = Math.max(1, Math.min(k, 32));
  const byteLength = output.byteLength;
  const top: MobileNetPredictionScore[] = [];

  if (options?.forceFloat && (byteLength < 4 || byteLength % 4 !== 0)) {
    throw new Error('Expected float32 output buffer from TFLite model.');
  }

  const shouldParseAsFloat =
    options?.forceFloat === true || (byteLength >= 4 && byteLength % 4 === 0 && byteLength / 4 <= 1001);

  if (shouldParseAsFloat) {
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
      insertTopPrediction(top, { classIndex: i, confidence }, limit);
    }
    return top;
  }

  const bytes = new Uint8Array(output);
  for (let i = 0; i < bytes.length; i++) {
    insertTopPrediction(
      top,
      {
        classIndex: i,
        confidence: (bytes[i] ?? 0) / 255,
      },
      limit,
    );
  }
  return top;
}

/** Returns top-3 predictions from float logits/probabilities or quantized classifier output. */
export function parseMobileNetTop3(
  output: ArrayBuffer,
  options?: { forceFloat?: boolean },
): MobileNetPredictionScore[] {
  return parseMobileNetTopK(output, 3, options);
}
