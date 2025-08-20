import { useAistackModuleInternal } from './internal';
import { NitroModules } from 'react-native-nitro-modules';
import type {
  ImageEmbedder as ImageEmbedderType,
  ImageEmbedderOptions,
  ImageEmbedderResult,
  Embedding,
} from '../specs/ImageEmbedder.nitro';
import type {
  ModelSource,
  AssetSource,
  ImagePreprocessingOptions,
} from '../common/types';
import { AistackError } from '../common/errors';
import { useState, useCallback } from 'react';
import { Platform, type PlatformOSType } from 'react-native';

/**
 * Represents the native ImageEmbedder module.
 * This is typically used internally by the `useImageEmbedder` hook.
 */
export const ImageEmbedder =
  NitroModules.createHybridObject<ImageEmbedderType>('ImageEmbedder');

const SUPPORTED_PLATFORMS: PlatformOSType[] = ['android'];

/**
 * A React hook for performing image embedding and computing cosine similarity between embeddings
 * using a MediaPipe ImageEmbedder model.
 *
 * @param source The source of the model to be used for embedding. This can be a local file path,
 *               a URI for a remote model, or a bundled asset path.
 * @param options Optional configuration options for the image embedder.
 * @returns An object containing:
 *          - `embed`: An asynchronous function that takes an `AssetSource` (e.g., URI to an image file)
 *                     and optional `ImagePreprocessingOptions`, then performs image embedding.
 *                     It returns a `Promise<ImageEmbedderResult | null>`.
 *          - `cosineSimilarity`: An asynchronous function that takes two `Embedding` objects and
 *                                computes their cosine similarity. It returns a `Promise<number | null>`.
 *          - `data`: The latest `ImageEmbedderResult` from the `embed` function, or `null` if no embedding has been performed yet.
 *          - `isLoading`: A boolean indicating whether the model is currently being loaded or initialized, or if embedding is in progress.
 *          - `error`: An `AistackError` object if an error occurred during model loading, initialization, embedding, or cosine similarity computation, otherwise `null`.
 * @throws {AistackError} If the hook is used on an unsupported platform.
 */
export function useImageEmbedder(
  source: ModelSource,
  options?: ImageEmbedderOptions
) {
  if (!SUPPORTED_PLATFORMS.includes(Platform.OS)) {
    throw new AistackError(
      `The 'useImageEmbedder' hook is not supported on ${Platform.OS}.`,
      'PLATFORM_NOT_SUPPORTED'
    );
  }

  const [data, setData] = useState<ImageEmbedderResult | null>(null);
  const {
    module: imageEmbedder,
    isLoading,
    error,
    setLoading,
    setError,
  } = useAistackModuleInternal(ImageEmbedder, source, options);

  const embed = useCallback(
    async (
      asset: AssetSource,
      preprocessing?: ImagePreprocessingOptions
    ): Promise<ImageEmbedderResult | null> => {
      if (imageEmbedder == null) {
        throw new Error('Image embedder is not initialized');
      }
      setLoading(true);
      try {
        const result = await imageEmbedder.embed(asset, preprocessing);
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
    [imageEmbedder, setLoading, setError]
  );

  const cosineSimilarity = useCallback(
    async (
      embedding1: Embedding,
      embedding2: Embedding
    ): Promise<number | null> => {
      if (imageEmbedder == null) {
        throw new Error('Image embedder is not initialized');
      }
      try {
        return await imageEmbedder.cosineSimilarity(embedding1, embedding2);
      } catch (e: any) {
        setError(
          e instanceof AistackError
            ? e
            : new AistackError(e.message, 'RUNTIME_ERROR', e)
        );
        return null;
      }
    },
    [imageEmbedder, setError]
  );

  return {
    embed,
    cosineSimilarity,
    data,
    isLoading,
    error,
  };
}
