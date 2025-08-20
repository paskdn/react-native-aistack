import { useAistackModuleInternal } from './internal';
import { FaceLandmarkerWrapper } from '../common/api-wrappers';
import type { FaceLandmarkerOptions } from '../specs/FaceLandmarker.nitro';
import type { FaceLandmarkerResult } from '../common/result-converters';
import type {
  ModelSource,
  AssetSource,
  ImagePreprocessingOptions,
} from '../common/types';
import { AistackError } from '../common/errors';
import { useState, useCallback } from 'react';
import { Platform, type PlatformOSType } from 'react-native';

/**
 * Represents the native FaceLandmarker module wrapper.
 * This is typically used internally by the `useFaceLandmarker` hook.
 */
export const FaceLandmarker = new FaceLandmarkerWrapper();

const SUPPORTED_PLATFORMS: PlatformOSType[] = ['android'];

/**
 * A React hook for performing face landmark detection in images or video frames using a MediaPipe FaceLandmarker model.
 *
 * @param source The source of the model to be used for landmark detection. This can be a local file path,
 *               a URI for a remote model, or a bundled asset path.
 * @param options Optional configuration options for the face landmarker, such as running mode (image, video, live stream)
 *                or number of faces to detect.
 * @returns An object containing:
 *          - `detect`: An asynchronous function that takes an `AssetSource` (e.g., URI to an image file)
 *                      and optional `ImagePreprocessingOptions`, then performs face landmark detection.
 *                      It returns a `Promise<FaceLandmarkerResult | null>`.
 *          - `data`: The latest `FaceLandmarkerResult` from the `detect` function, or `null` if no detection has been performed yet.
 *          - `isLoading`: A boolean indicating whether the model is currently being loaded or initialized, or if detection is in progress.
 *          - `error`: An `AistackError` object if an error occurred during model loading, initialization, or detection, otherwise `null`.
 * @throws {AistackError} If the hook is used on an unsupported platform.
 */
export function useFaceLandmarker(
  source: ModelSource,
  options?: FaceLandmarkerOptions
) {
  if (!SUPPORTED_PLATFORMS.includes(Platform.OS)) {
    throw new AistackError(
      `The 'useFaceLandmarker' hook is not supported on ${Platform.OS}.`,
      'PLATFORM_NOT_SUPPORTED'
    );
  }

  const [data, setData] = useState<FaceLandmarkerResult | null>(null);
  const {
    module: faceLandmarker,
    isLoading,
    error,
    setLoading,
    setError,
  } = useAistackModuleInternal(FaceLandmarker, source, options);

  const detect = useCallback(
    async (
      asset: AssetSource,
      preprocessing?: ImagePreprocessingOptions
    ): Promise<FaceLandmarkerResult | null> => {
      if (faceLandmarker == null) {
        throw new Error('Face landmarker is not initialized');
      }
      setLoading(true);
      try {
        const result = await faceLandmarker.detect(asset, preprocessing);
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
    [faceLandmarker, setLoading, setError]
  );

  return { detect, data, isLoading, error };
}
