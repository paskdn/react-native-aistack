import { useAistackModuleInternal } from './internal';
import { NitroModules } from 'react-native-nitro-modules';
import type {
  InteractiveSegmenter as InteractiveSegmenterType,
  InteractiveSegmenterOptions,
  InteractiveSegmenterResult,
  RegionOfInterest,
} from '../specs/InteractiveSegmenter.nitro';
import type {
  ModelSource,
  AssetSource,
  ImagePreprocessingOptions,
} from '../common/types';
import { AistackError } from '../common/errors';
import { useState, useCallback } from 'react';
import { Platform, type PlatformOSType } from 'react-native';

/**
 * Represents the native InteractiveSegmenter module.
 * This is typically used internally by the `useInteractiveSegmenter` hook.
 */
export const InteractiveSegmenter =
  NitroModules.createHybridObject<InteractiveSegmenterType>(
    'InteractiveSegmenter'
  );

const SUPPORTED_PLATFORMS: PlatformOSType[] = ['android'];

/**
 * A React hook for performing interactive image segmentation in images or video frames using a MediaPipe InteractiveSegmenter model.
 *
 * @param source The source of the model to be used for segmentation. This can be a local file path,
 *               a URI for a remote model, or a bundled asset path.
 * @param options Optional configuration options for the interactive segmenter.
 * @returns An object containing:
 *          - `segment`: An asynchronous function that takes an `AssetSource` (e.g., URI to an image file),
 *                       a `RegionOfInterest` (defining the area to segment), and optional `ImagePreprocessingOptions`,
 *                       then performs interactive image segmentation.
 *                       It returns a `Promise<InteractiveSegmenterResult | null>`.
 *          - `data`: The latest `InteractiveSegmenterResult` from the `segment` function, or `null` if no segmentation has been performed yet.
 *          - `isLoading`: A boolean indicating whether the model is currently being loaded or initialized, or if segmentation is in progress.
 *          - `error`: An `AistackError` object if an error occurred during model loading, initialization, or segmentation, otherwise `null`.
 * @throws {AistackError} If the hook is used on an unsupported platform.
 */
export function useInteractiveSegmenter(
  source: ModelSource,
  options?: InteractiveSegmenterOptions
) {
  if (!SUPPORTED_PLATFORMS.includes(Platform.OS)) {
    throw new AistackError(
      `The 'useInteractiveSegmenter' hook is not supported on ${Platform.OS}.`,
      'PLATFORM_NOT_SUPPORTED'
    );
  }

  const [data, setData] = useState<InteractiveSegmenterResult | null>(null);
  const {
    module: interactiveSegmenter,
    isLoading,
    error,
    setLoading,
    setError,
  } = useAistackModuleInternal(InteractiveSegmenter, source, options);

  const segment = useCallback(
    async (
      asset: AssetSource,
      regionOfInterest: RegionOfInterest,
      preprocessing?: ImagePreprocessingOptions
    ): Promise<InteractiveSegmenterResult | null> => {
      if (interactiveSegmenter == null) {
        throw new Error('Interactive segmenter is not initialized');
      }
      setLoading(true);
      try {
        const result = await interactiveSegmenter.segment(
          asset,
          regionOfInterest,
          preprocessing
        );
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
    [interactiveSegmenter, setLoading, setError]
  );

  return { segment, data, isLoading, error };
}
