import { useAistackModuleInternal } from './internal';
import { HandLandmarkerWrapper } from '../common/api-wrappers';
import type { HandLandmarkerOptions } from '../specs/HandLandmarker.nitro';
import type { HandLandmarkerResult } from '../common/result-converters';
import type {
  ModelSource,
  AssetSource,
  ImagePreprocessingOptions,
} from '../common/types';
import { AistackError } from '../common/errors';
import { useState, useCallback } from 'react';
import { Platform, type PlatformOSType } from 'react-native';

/**
 * A React hook for performing hand landmark detection.
 *
 * @param source The model to be used for detection.
 * @param options Configuration options for the hand landmarker.
 * @returns An object containing:
 *          - `detect`: A function to trigger the detection for single images.
 *          - `data`: The latest detection result.
 *          - `isLoading`: A boolean indicating if the model is loading or processing.
 *          - `error`: An error object if something went wrong.
 */
/**
 * Represents the native HandLandmarker module wrapper.
 * This is typically used internally by the `useHandLandmarker` hook.
 */
export const HandLandmarker = new HandLandmarkerWrapper();

const SUPPORTED_PLATFORMS: PlatformOSType[] = ['android'];

/**
 * A React hook for performing hand landmark detection in images or video frames using a MediaPipe HandLandmarker model.
 *
 * @param source The source of the model to be used for landmark detection. This can be a local file path,
 *               a URI for a remote model, or a bundled asset path.
 * @param options Optional configuration options for the hand landmarker, such as running mode (image, video, live stream)
 *                or number of hands to detect.
 * @returns An object containing:
 *          - `detect`: An asynchronous function that takes an `AssetSource` (e.g., URI to an image file)
 *                      and optional `ImagePreprocessingOptions`, then performs hand landmark detection.
 *                      It returns a `Promise<HandLandmarkerResult | null>`.
 *          - `data`: The latest `HandLandmarkerResult` from the `detect` function, or `null` if no detection has been performed yet.
 *          - `isLoading`: A boolean indicating whether the model is currently being loaded or initialized, or if detection is in progress.
 *          - `error`: An `AistackError` object if an error occurred during model loading, initialization, or detection, otherwise `null`.
 * @throws {AistackError} If the hook is used on an unsupported platform.
 */
export function useHandLandmarker(
  source: ModelSource,
  options?: HandLandmarkerOptions
) {
  if (!SUPPORTED_PLATFORMS.includes(Platform.OS)) {
    throw new AistackError(
      `The 'useHandLandmarker' hook is not supported on ${Platform.OS}.`,
      'PLATFORM_NOT_SUPPORTED'
    );
  }

  const [data, setData] = useState<HandLandmarkerResult | null>(null);
  const {
    module: handLandmarker,
    isLoading,
    error,
    setLoading,
    setError,
  } = useAistackModuleInternal(HandLandmarker, source, options);

  const detect = useCallback(
    async (
      asset: AssetSource,
      preprocessing?: ImagePreprocessingOptions
    ): Promise<HandLandmarkerResult | null> => {
      if (handLandmarker == null) {
        throw new Error('Hand landmarker is not initialized');
      }
      setLoading(true);
      try {
        const result = await handLandmarker.detect(asset, preprocessing);
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
    [handLandmarker, setLoading, setError]
  );

  return { detect, data, isLoading, error };
}
