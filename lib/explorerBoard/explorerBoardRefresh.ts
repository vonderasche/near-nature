type Listener = () => void;

const listeners = new Set<Listener>();

/** Subscribe to Explorer Board refresh requests (e.g. after avatar upload). */
export function subscribeExplorerBoardRefresh(listener: Listener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function requestExplorerBoardRefresh(): void {
  for (const listener of listeners) {
    listener();
  }
}
