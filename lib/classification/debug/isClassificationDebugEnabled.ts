/** When true, classification telemetry is sent to configured sinks (Supabase). */
export function isClassificationDebugEnabled(): boolean {
  return process.env.EXPO_PUBLIC_CLASSIFICATION_DEBUG === '1';
}
