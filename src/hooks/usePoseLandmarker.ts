import { useAistackModuleInternal } from './internal';
import { PoseLandmarkerWrapper } from '../common/api-wrappers';
import type { PoseLandmarkerOptions } from '../specs/PoseLandmarker.nitro';
import type { PoseLandmarkerResult } from '../common/result-converters';
import type {
  ModelSource,
  AssetSource,
  ImagePreprocessingOptions,
} from '../common/types';
import { AistackError } from '../common/errors';
import { useState, useCallback } from 'react';

/**
 * Represents the native PoseLandmarker module wrapper.
 * This is typically used internally by the `usePoseLandmarker` hook.
 */
export const PoseLandmarker = new PoseLandmarkerWrapper();

/**
 * A React hook for performing pose landmark detection in images or video frames using a MediaPipe PoseLandmarker model.
 *
 * @param source The source of the model to be used for landmark detection. This can be a local file path,
 *               a URI for a remote model, or a bundled asset path.
 * @param options Optional configuration options for the pose landmarker, such as running mode (image, video, live stream)
 *                or number of poses to detect.
 * @returns A tuple containing:
 *          - `detect`: An asynchronous function that takes an `AssetSource` (e.g., URI to an image file)
 *                      and optional `ImagePreprocessingOptions`, then performs pose landmark detection.
 *                      It returns a `Promise<PoseLandmarkerResult | null>`.
 *          - An object with the current state:
 *            - `data`: The latest `PoseLandmarkerResult` from the `detect` function, or `null` if no detection has been performed yet.
 *            - `isLoading`: A boolean indicating whether the model is currently being loaded or initialized, or if detection is in progress.
 *            - `error`: An `AistackError` object if an error occurred during model loading, initialization, or detection, otherwise `null`.
 */
export function usePoseLandmarker(
  source: ModelSource,
  options?: PoseLandmarkerOptions
) {
  const [data, setData] = useState<PoseLandmarkerResult | null>(null);
  const {
    module: poseLandmarker,
    isLoading,
    error,
    setLoading,
    setError,
  } = useAistackModuleInternal(PoseLandmarker, source, options);

  const detect = useCallback(
    async (
      asset: AssetSource,
      preprocessing?: ImagePreprocessingOptions
    ): Promise<PoseLandmarkerResult | null> => {
      if (poseLandmarker == null) {
        throw new Error('Pose landmarker is not initialized');
      }
      setLoading(true);
      try {
        const result = await poseLandmarker.detect(asset, preprocessing);
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
    [poseLandmarker, setLoading, setError]
  );

  return [
    detect,
    {
      data,
      isLoading,
      error,
    },
  ] as const;
}
