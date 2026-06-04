type Listener = () => void;

const listeners = new Set<Listener>();

/** Subscribe to profile data refresh (scoring, stats, gallery) after saves/deletes. */
export function subscribeProfileRefresh(listener: Listener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function requestProfileRefresh(): void {
  for (const listener of listeners) {
    listener();
  }
}
