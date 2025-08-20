import { useAistackModuleInternal } from './internal';
import { ImageClassifierWrapper } from '../common/api-wrappers';
import type { ImageClassifierOptions } from '../specs/ImageClassifier.nitro';
import type { ImageClassifierResult } from '../common/result-converters';
import type {
  ModelSource,
  AssetSource,
  ImagePreprocessingOptions,
} from '../common/types';
import { AistackError } from '../common/errors';
import { useState, useCallback } from 'react';
import { Platform, type PlatformOSType } from 'react-native';

/**
 * Represents the native ImageClassifier module wrapper.
 * This is typically used internally by the `useImageClassifier` hook.
 */
export const ImageClassifier = new ImageClassifierWrapper();

const SUPPORTED_PLATFORMS: PlatformOSType[] = ['android'];

/**
 * A React hook for performing image classification in images or video frames using a MediaPipe ImageClassifier model.
 *
 * @param source The source of the model to be used for classification. This can be a local file path,
 *               a URI for a remote model, or a bundled asset path.
 * @param options Optional configuration options for the image classifier, such as running mode (image, video, live stream)
 *                or score threshold.
 * @returns An object containing:
 *          - `classify`: An asynchronous function that takes an `AssetSource` (e.g., URI to an image file)
 *                        and optional `ImagePreprocessingOptions`, then performs image classification.
 *                        It returns a `Promise<ImageClassifierResult | null>`.
 *          - `data`: The latest `ImageClassifierResult` from the `classify` function, or `null` if no classification has been performed yet.
 *          - `isLoading`: A boolean indicating whether the model is currently being loaded or initialized, or if classification is in progress.
 *          - `error`: An `AistackError` object if an error occurred during model loading, initialization, or classification, otherwise `null`.
 * @throws {AistackError} If the hook is used on an unsupported platform.
 */
export function useImageClassifier(
  source: ModelSource,
  options?: ImageClassifierOptions
) {
  if (!SUPPORTED_PLATFORMS.includes(Platform.OS)) {
    throw new AistackError(
      `The 'useImageClassifier' hook is not supported on ${Platform.OS}.`,
      'PLATFORM_NOT_SUPPORTED'
    );
  }

  const [data, setData] = useState<ImageClassifierResult | null>(null);
  const {
    module: imageClassifier,
    isLoading,
    error,
    setLoading,
    setError,
  } = useAistackModuleInternal(ImageClassifier, source, options);

  const classify = useCallback(
    async (
      asset: AssetSource,
      preprocessing?: ImagePreprocessingOptions
    ): Promise<ImageClassifierResult | null> => {
      if (imageClassifier == null) {
        throw new Error('Image classifier is not initialized');
      }
      setLoading(true);
      try {
        const result = await imageClassifier.classify(asset, preprocessing);
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
    [imageClassifier, setLoading, setError]
  );

  return {
    classify,
    data,
    isLoading,
    error,
  };
}
