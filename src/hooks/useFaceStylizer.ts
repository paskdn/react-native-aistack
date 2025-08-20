import { useAistackModuleInternal } from './internal';
import { NitroModules } from 'react-native-nitro-modules';
import type {
  FaceStylizer as FaceStylizerType,
  FaceStylizerOptions,
  FaceStylizerResult,
} from '../specs/FaceStylizer.nitro';
import type {
  ModelSource,
  AssetSource,
  ImagePreprocessingOptions,
} from '../common/types';
import { AistackError } from '../common/errors';
import { useState, useCallback } from 'react';
import { Platform, type PlatformOSType } from 'react-native';

/**
 * Represents the native FaceStylizer module.
 * This is typically used internally by the `useFaceStylizer` hook.
 */
export const FaceStylizer =
  NitroModules.createHybridObject<FaceStylizerType>('FaceStylizer');

const SUPPORTED_PLATFORMS: PlatformOSType[] = ['android'];

/**
 * A React hook for performing face stylization in images or video frames using a MediaPipe FaceStylizer model.
 *
 * @param source The source of the model to be used for stylization. This can be a local file path,
 *               a URI for a remote model, or a bundled asset path.
 * @param options Optional configuration options for the face stylizer.
 * @returns An object containing:
 *          - `stylize`: An asynchronous function that takes an `AssetSource` (e.g., URI to an image file)
 *                       and optional `ImagePreprocessingOptions`, then performs face stylization.
 *                       It returns a `Promise<FaceStylizerResult | null>`.
 *          - `data`: The latest `FaceStylizerResult` from the `stylize` function, or `null` if no stylization has been performed yet.
 *          - `isLoading`: A boolean indicating whether the model is currently being loaded or initialized, or if stylization is in progress.
 *          - `error`: An `AistackError` object if an error occurred during model loading, initialization, or stylization, otherwise `null`.
 * @throws {AistackError} If the hook is used on an unsupported platform.
 */
export function useFaceStylizer(
  source: ModelSource,
  options?: FaceStylizerOptions
) {
  if (!SUPPORTED_PLATFORMS.includes(Platform.OS)) {
    throw new AistackError(
      `The 'useFaceStylizer' hook is not supported on ${Platform.OS}.`,
      'PLATFORM_NOT_SUPPORTED'
    );
  }

  const [data, setData] = useState<FaceStylizerResult | null>(null);
  const {
    module: faceStylizer,
    isLoading,
    error,
    setLoading,
    setError,
  } = useAistackModuleInternal(FaceStylizer, source, options);

  const stylize = useCallback(
    async (
      asset: AssetSource,
      preprocessing?: ImagePreprocessingOptions
    ): Promise<FaceStylizerResult | null> => {
      if (faceStylizer == null) {
        throw new Error('Face stylizer is not initialized');
      }
      setLoading(true);
      try {
        const result = await faceStylizer.stylize(asset, preprocessing);
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
    [faceStylizer, setLoading, setError]
  );

  return { stylize, data, isLoading, error };
}
