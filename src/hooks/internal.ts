import { useState } from 'react';
import useDeepCompareEffect from 'use-deep-compare-effect';
import type { ModelSource } from '../common/types';
import { AistackError } from '../common/errors';

/**
 * A generic type for our task-specific modules.
 * They must have an `initialize` and `unload` method.
 */
interface ITaskModule {
  initialize: (source: ModelSource, options?: any) => Promise<void>;
  unload: () => void;
  // This allows indexing with a string for the action name
  [key: string]: any;
}

/**
 * An internal hook to manage the lifecycle (initialization, unloading) and state
 * (isLoading, error) of a stateful Aistack module.
 *
 * @param module The stateful Nitro module for the task.
 * @param source The model source to initialize the module with.
 * @param options The configuration options for the module.
 * @returns An object containing the module instance and its current state.
 */
export function useAistackModuleInternal<TModule extends ITaskModule, TOptions>(
  module: TModule,
  source: ModelSource,
  options?: TOptions
) {
  const [isReady, setIsReady] = useState(false);
  const [state, setState] = useState<{
    isLoading: boolean;
    error: AistackError | null;
  }>({ isLoading: false, error: null });

  // Effect for initializing and unloading the module
  useDeepCompareEffect(() => {
    let isMounted = true;
    let isInitializing = false;

    const load = async () => {
      // Prevent multiple simultaneous initialization attempts
      if (isInitializing) {
        return;
      }

      isInitializing = true;
      setIsReady(false);
      setState({ isLoading: true, error: null });

      try {
        await module.initialize(source, options);
        if (isMounted) {
          setIsReady(true);
          setState((s) => ({ ...s, isLoading: false }));
        }
      } catch (e: any) {
        const error =
          e instanceof AistackError
            ? e
            : new AistackError(e.message, 'MODEL_LOAD_FAILED', e);
        if (isMounted) {
          setIsReady(false);
          setState((s) => ({ ...s, error, isLoading: false }));
        }
      } finally {
        isInitializing = false;
      }
    };

    load();

    return () => {
      isMounted = false;
      isInitializing = false;
      module.unload();
    };
  }, [source, options]);

  return {
    ...state,
    isLoading: state.isLoading,
    module: isReady ? module : null,
    setLoading: (isLoading: boolean) => setState((s) => ({ ...s, isLoading })),
    setError: (error: AistackError | null) =>
      setState((s) => ({ ...s, error })),
  };
}
