import { useAistackModuleInternal } from './internal';
import { NitroModules } from 'react-native-nitro-modules';
import type {
  AudioClassifier as AudioClassifierType,
  AudioClassifierOptions,
  AudioClassifierResult,
} from '../specs/AudioClassifier.nitro';
import type {
  ModelSource,
  AssetSource,
  AudioPreprocessingOptions,
} from '../common/types';
import { AistackError } from '../common/errors';
import { useState, useCallback } from 'react';

/**
 * Represents the native AudioClassifier module.
 * This is typically used internally by the `useAudioClassifier` hook.
 */
export const AudioClassifier =
  NitroModules.createHybridObject<AudioClassifierType>('AudioClassifier');

/**
 * A React hook for performing audio classification using a MediaPipe AudioClassifier model.
 *
 * @param source The source of the model to be used for classification. This can be a local file path,
 *               a URI for a remote model, or a bundled asset path.
 * @param options Optional configuration options for the audio classifier.
 * @returns An object containing:
 *          - `classify`: An asynchronous function that takes an `AssetSource` (e.g., URI to an audio file)
 *                        and optional `AudioPreprocessingOptions`, then performs audio classification.
 *                        It returns a `Promise<AudioClassifierResult | null>`.
 *          - `data`: The latest `AudioClassifierResult` from the `classify` function, or `null` if no classification has been performed yet.
 *          - `isLoading`: A boolean indicating whether the model is currently being loaded or initialized, or if classification is in progress.
 *          - `error`: An `AistackError` object if an error occurred during model loading, initialization, or classification, otherwise `null`.
 */
export function useAudioClassifier(
  source: ModelSource,
  options?: AudioClassifierOptions
) {
  const [data, setData] = useState<AudioClassifierResult | null>(null);
  const {
    module: audioClassifier,
    isLoading,
    error,
    setLoading,
    setError,
  } = useAistackModuleInternal(AudioClassifier, source, options);

  const classify = useCallback(
    async (
      asset: AssetSource,
      preprocessing?: AudioPreprocessingOptions
    ): Promise<AudioClassifierResult | null> => {
      if (audioClassifier == null) {
        throw new Error('Audio classifier is not initialized');
      }
      setLoading(true);
      try {
        const result = await audioClassifier.classify(asset, preprocessing);
        setData(result);
        return result;
      } catch (e: any) {
        setError(
          e instanceof AistackError
            ? e
            : new AistackError(e.message, 'RUNTIME_ERROR', e)
        );
        return null;
      } finally {
        setLoading(false);
      }
    },
    [audioClassifier, setLoading, setError]
  );

  return { classify, data, isLoading, error };
}
