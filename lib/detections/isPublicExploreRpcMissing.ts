export function isPublicExploreRpcMissing(error: { code?: string; message?: string }): boolean {
  const message = (error.message ?? '').toLowerCase();
  return (
    error.code === 'PGRST202' ||
    error.code === '42883' ||
    message.includes('search_public_detections') ||
    message.includes('does not exist') ||
    message.includes('permission denied for table users')
  );
}
