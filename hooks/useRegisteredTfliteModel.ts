import { useEffect, useMemo, useState } from 'react';
import { NitroModules } from 'react-native-nitro-modules';
import type { TensorflowModelDelegate, TfliteModel } from 'react-native-fast-tflite';

import { loadBundledTfliteModel } from '@/lib/camera/tflite/loadBundledTfliteModel';
import type { TfliteModelConfig } from '@/lib/camera/tflite/modelTypes';

type ModelLoadState =
  | { state: 'loading'; model: undefined; error: undefined }
  | { state: 'loaded'; model: TfliteModel; error: undefined }
  | { state: 'error'; model: undefined; error: Error };

export function useRegisteredTfliteModel(
  config: TfliteModelConfig,
  delegates: TensorflowModelDelegate[] = [],
) {
  const [loadState, setLoadState] = useState<ModelLoadState>({
    state: 'loading',
    model: undefined,
    error: undefined,
  });

  const delegatesKey = delegates.join(',');

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        setLoadState({ state: 'loading', model: undefined, error: undefined });
        const model = await loadBundledTfliteModel(config.model, delegates);

        if (!cancelled) {
          setLoadState({ state: 'loaded', model, error: undefined });
        }
      } catch (error) {
        if (!cancelled) {
          setLoadState({
            state: 'error',
            model: undefined,
            error: error instanceof Error ? error : new Error(String(error)),
          });
        }
      }
    };

    void load();

    return () => {
      cancelled = true;
    };
  }, [config.id, config.model, delegatesKey]);

  const boxedModel = useMemo(() => {
    if (loadState.state !== 'loaded') {
      return undefined;
    }

    return NitroModules.box(loadState.model);
  }, [loadState.state, loadState.model]);

  return {
    state: loadState.state,
    model: loadState.model,
    error: loadState.error,
    boxedModel,
  };
}
