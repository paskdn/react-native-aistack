import { useAistackModuleInternal } from './internal';
import { NitroModules } from 'react-native-nitro-modules';
import type {
  FaceDetector as FaceDetectorType,
  FaceDetectorOptions,
  FaceDetectionResult,
} from '../specs/FaceDetection.nitro';
import type {
  ModelSource,
  AssetSource,
  ImagePreprocessingOptions,
} from '../common/types';
import { AistackError } from '../common/errors';
import { useState, useCallback } from 'react';

/**
 * Represents the native FaceDetector module.
 * This is typically used internally by the `useFaceDetector` hook.
 */
export const FaceDetector =
  NitroModules.createHybridObject<FaceDetectorType>('FaceDetector');

/**
 * A React hook for performing face detection in images or video frames using a MediaPipe FaceDetector model.
 *
 * @param source The source of the model to be used for detection. This can be a local file path,
 *               a URI for a remote model, or a bundled asset path.
 * @param options Optional configuration options for the face detector, such as running mode (image, video, live stream)
 *                or minimum detection confidence.
 * @returns An object containing:
 *          - `detect`: An asynchronous function that takes an `AssetSource` (e.g., URI to an image file)
 *                      and optional `ImagePreprocessingOptions`, then performs face detection.
 *                      It returns a `Promise<FaceDetectionResult | null>`.
 *          - `data`: The latest `FaceDetectionResult` from the `detect` function, or `null` if no detection has been performed yet.
 *          - `isLoading`: A boolean indicating whether the model is currently being loaded or initialized, or if detection is in progress.
 *          - `error`: An `AistackError` object if an error occurred during model loading, initialization, or detection, otherwise `null`.
 */
export function useFaceDetector(
  source: ModelSource,
  options?: FaceDetectorOptions
) {
  const [data, setData] = useState<FaceDetectionResult | null>(null);
  const {
    module: faceDetector,
    isLoading,
    error,
    setLoading,
    setError,
  } = useAistackModuleInternal(FaceDetector, source, options);

  const detect = useCallback(
    async (
      asset: AssetSource,
      preprocessing?: ImagePreprocessingOptions
    ): Promise<FaceDetectionResult | null> => {
      if (faceDetector == null) {
        throw new Error('Face detector is not initialized');
      }
      setLoading(true);
      try {
        const result = await faceDetector.detect(asset, preprocessing);
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
    [faceDetector, setLoading, setError]
  );

  return { detect, data, isLoading, error };
}
