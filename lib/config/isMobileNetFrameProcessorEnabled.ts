/** When true, run MobileNet TFLite on live camera frames (dev / test builds). */
export function isMobileNetFrameProcessorEnabled(): boolean {
  const raw = process.env.EXPO_PUBLIC_MOBILENET_FRAME_PROCESSOR?.trim().toLowerCase();
  return raw === '1' || raw === 'true' || raw === 'yes';
}
