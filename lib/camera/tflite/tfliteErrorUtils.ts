export function isTflitePrepareCompatibilityError(message: string): boolean {
  const normalized = message.toLowerCase();
  return (
    normalized.includes('failed to prepare') ||
    normalized.includes('float16') ||
    normalized.includes('ceil.cc') ||
    normalized.includes('conv.cc') ||
    (normalized.includes('node number') && normalized.includes('failed'))
  );
}

export function isTfliteMemoryAllocationError(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error);
  if (isTflitePrepareCompatibilityError(message)) {
    return false;
  }

  const normalized = message.toLowerCase();
  return (
    normalized.includes('allocate memory') ||
    normalized.includes('failed to allocate memory') ||
    normalized.includes('not enough device memory') ||
    normalized.includes('not enough runtime memory') ||
    normalized.includes('oom') ||
    normalized.includes('outofmemory')
  );
}
