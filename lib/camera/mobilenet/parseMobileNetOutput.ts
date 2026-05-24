export type MobileNetTop1 = {
  classIndex: number;
  confidence: number;
};

/** Picks the highest-scoring class from a quantized (uint8) or float MobileNet output. */
export function parseMobileNetTop1(output: ArrayBuffer): MobileNetTop1 {
  'worklet';
  const byteLength = output.byteLength;

  if (byteLength >= 4 && byteLength % 4 === 0 && byteLength / 4 <= 1001) {
    const floats = new Float32Array(output);
    let classIndex = 0;
    let best = floats[0] ?? 0;
    for (let i = 1; i < floats.length; i++) {
      const v = floats[i] ?? 0;
      if (v > best) {
        best = v;
        classIndex = i;
      }
    }
    return { classIndex, confidence: Math.min(1, Math.max(0, best)) };
  }

  const bytes = new Uint8Array(output);
  let classIndex = 0;
  let best = bytes[0] ?? 0;
  for (let i = 1; i < bytes.length; i++) {
    const v = bytes[i] ?? 0;
    if (v > best) {
      best = v;
      classIndex = i;
    }
  }
  return { classIndex, confidence: best / 255 };
}
