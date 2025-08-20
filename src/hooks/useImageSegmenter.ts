import { useAistackModuleInternal } from './internal';
import { NitroModules } from 'react-native-nitro-modules';
import type {
  ImageSegmenter as ImageSegmenterType,
  ImageSegmenterOptions,
  ImageSegmenterResult,
} from '../specs/ImageSegmenter.nitro';
import type {
  ModelSource,
  AssetSource,
  ImagePreprocessingOptions,
} from '../common/types';
import { AistackError } from '../common/errors';
import { useState, useCallback } from 'react';
import { Platform, type PlatformOSType } from 'react-native';

/**
 * Represents the native ImageSegmenter module.
 * This is typically used internally by the `useImageSegmenter` hook.
 */
export const ImageSegmenter =
  NitroModules.createHybridObject<ImageSegmenterType>('ImageSegmenter');

const SUPPORTED_PLATFORMS: PlatformOSType[] = ['android'];

/**
 * A React hook for performing image segmentation in images or video frames using a MediaPipe ImageSegmenter model.
 *
 * @param source The source of the model to be used for segmentation. This can be a local file path,
 *               a URI for a remote model, or a bundled asset path.
 * @param options Optional configuration options for the image segmenter, such as running mode (image, video, live stream)
 *                or output mask type.
 * @returns An object containing:
 *          - `segment`: An asynchronous function that takes an `AssetSource` (e.g., URI to an image file)
 *                       and optional `ImagePreprocessingOptions`, then performs image segmentation.
 *                       It returns a `Promise<ImageSegmenterResult | null>`.
 *          - `data`: The latest `ImageSegmenterResult` from the `segment` function, or `null` if no segmentation has been performed yet.
 *          - `isLoading`: A boolean indicating whether the model is currently being loaded or initialized, or if segmentation is in progress.
 *          - `error`: An `AistackError` object if an error occurred during model loading, initialization, or segmentation, otherwise `null`.
 * @throws {AistackError} If the hook is used on an unsupported platform.
 */
export function useImageSegmenter(
  source: ModelSource,
  options?: ImageSegmenterOptions
) {
  if (!SUPPORTED_PLATFORMS.includes(Platform.OS)) {
    throw new AistackError(
      `The 'useImageSegmenter' hook is not supported on ${Platform.OS}.`,
      'PLATFORM_NOT_SUPPORTED'
    );
  }

  const [data, setData] = useState<ImageSegmenterResult | null>(null);
  const {
    module: imageSegmenter,
    isLoading,
    error,
    setLoading,
    setError,
  } = useAistackModuleInternal(ImageSegmenter, source, options);

  const segment = useCallback(
    async (
      asset: AssetSource,
      preprocessing?: ImagePreprocessingOptions
    ): Promise<ImageSegmenterResult | null> => {
      if (imageSegmenter == null) {
        throw new Error('Image segmenter is not initialized');
      }
      setLoading(true);
      try {
        const result = await imageSegmenter.segment(asset, preprocessing);
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
    [imageSegmenter, setLoading, setError]
  );

  return { segment, data, isLoading, error };
}
