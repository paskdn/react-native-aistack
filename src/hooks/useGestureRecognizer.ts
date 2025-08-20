import { useAistackModuleInternal } from './internal';
import { GestureRecognizerWrapper } from '../common/api-wrappers';
import type { GestureRecognizerOptions } from '../specs/GestureRecognizer.nitro';
import type { GestureRecognizerResult } from '../common/result-converters';
import type {
  ModelSource,
  AssetSource,
  ImagePreprocessingOptions,
} from '../common/types';
import { AistackError } from '../common/errors';
import { useState, useCallback } from 'react';
import { Platform, type PlatformOSType } from 'react-native';

/**
 * Represents the native GestureRecognizer module wrapper.
 * This is typically used internally by the `useGestureRecognizer` hook.
 */
export const GestureRecognizer = new GestureRecognizerWrapper();

const SUPPORTED_PLATFORMS: PlatformOSType[] = ['android'];

/**
 * A React hook for performing gesture recognition in images or video frames using a MediaPipe GestureRecognizer model.
 *
 * @param source The source of the model to be used for recognition. This can be a local file path,
 *               a URI for a remote model, or a bundled asset path.
 * @param options Optional configuration options for the gesture recognizer, such as running mode (image, video, live stream)
 *                or minimum detection confidence.
 * @returns An object containing:
 *          - `recognize`: An asynchronous function that takes an `AssetSource` (e.g., URI to an image file)
 *                         and optional `ImagePreprocessingOptions`, then performs gesture recognition.
 *                         It returns a `Promise<GestureRecognizerResult | null>`.
 *          - `data`: The latest `GestureRecognizerResult` from the `recognize` function, or `null` if no recognition has been performed yet.
 *          - `isLoading`: A boolean indicating whether the model is currently being loaded or initialized, or if recognition is in progress.
 *          - `error`: An `AistackError` object if an error occurred during model loading, initialization, or recognition, otherwise `null`.
 * @throws {AistackError} If the hook is used on an unsupported platform.
 */
export function useGestureRecognizer(
  source: ModelSource,
  options?: GestureRecognizerOptions
) {
  if (!SUPPORTED_PLATFORMS.includes(Platform.OS)) {
    throw new AistackError(
      `The 'useGestureRecognizer' hook is not supported on ${Platform.OS}.`,
      'PLATFORM_NOT_SUPPORTED'
    );
  }

  const [data, setData] = useState<GestureRecognizerResult | null>(null);
  const {
    module: gestureRecognizer,
    isLoading,
    error,
    setLoading,
    setError,
  } = useAistackModuleInternal(GestureRecognizer, source, options);

  const recognize = useCallback(
    async (
      asset: AssetSource,
      preprocessing?: ImagePreprocessingOptions
    ): Promise<GestureRecognizerResult | null> => {
      if (gestureRecognizer == null) {
        throw new Error('Gesture recognizer is not initialized');
      }
      setLoading(true);
      try {
        const result = await gestureRecognizer.recognize(asset, preprocessing);
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
    [gestureRecognizer, setLoading, setError]
  );

  return {
    recognize,
    data,
    isLoading,
    error,
  };
}
