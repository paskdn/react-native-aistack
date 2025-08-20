import { useAistackModuleInternal } from './internal';
import { NitroModules } from 'react-native-nitro-modules';
import type {
  ObjectDetector as ObjectDetectorType,
  ObjectDetectorOptions,
  ObjectDetectorResult,
} from '../specs/ObjectDetector.nitro';
import type {
  ModelSource,
  AssetSource,
  ImagePreprocessingOptions,
} from '../common/types';
import { AistackError } from '../common/errors';
import { useState, useCallback } from 'react';

/**
 * Represents the native ObjectDetector module.
 * This is typically used internally by the `useObjectDetector` hook.
 */
export const ObjectDetector =
  NitroModules.createHybridObject<ObjectDetectorType>('ObjectDetector');

/**
 * A React hook for performing object detection in images or video frames using a MediaPipe ObjectDetector model.
 *
 * @param source The source of the model to be used for detection. This can be a local file path,
 *               a URI for a remote model, or a bundled asset path.
 * @param options Optional configuration options for the object detector, such as running mode (image, video, live stream)
 *                or minimum detection confidence.
 * @returns An object containing:
 *          - `detect`: An asynchronous function that takes an `AssetSource` (e.g., URI to an image file)
 *                      and optional `ImagePreprocessingOptions`, then performs object detection.
 *                      It returns a `Promise<ObjectDetectorResult | null>`.
 *          - `data`: The latest `ObjectDetectorResult` from the `detect` function, or `null` if no detection has been performed yet.
 *          - `isLoading`: A boolean indicating whether the model is currently being loaded or initialized, or if detection is in progress.
 *          - `error`: An `AistackError` object if an error occurred during model loading, initialization, or detection, otherwise `null`.
 */
export function useObjectDetector(
  source: ModelSource,
  options?: ObjectDetectorOptions
) {
  const [data, setData] = useState<ObjectDetectorResult | null>(null);

  const {
    module: objectDetector,
    isLoading,
    error,
    setLoading,
    setError,
  } = useAistackModuleInternal(ObjectDetector, source, options);

  const detect = useCallback(
    async (
      asset: AssetSource,
      preprocessing?: ImagePreprocessingOptions
    ): Promise<ObjectDetectorResult | null> => {
      if (objectDetector == null) {
        throw new Error('Object detector is not initialized');
      }
      setLoading(true);
      try {
        const result = await objectDetector.detect(asset, preprocessing);
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
    [objectDetector, setLoading, setError]
  );

  return { detect, data, isLoading, error };
}
