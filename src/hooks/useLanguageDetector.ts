import { useAistackModuleInternal } from './internal';
import { NitroModules } from 'react-native-nitro-modules';
import type {
  LanguageDetector as LanguageDetectorType,
  LanguageDetectorOptions,
  LanguageDetectorResult,
} from '../specs/LanguageDetector.nitro';
import type { ModelSource } from '../common/types';
import { AistackError } from '../common/errors';
import { useState } from 'react';
import { Platform, type PlatformOSType } from 'react-native';

/**
 * Represents the native LanguageDetector module.
 * This is typically used internally by the `useLanguageDetector` hook.
 */
export const LanguageDetector =
  NitroModules.createHybridObject<LanguageDetectorType>('LanguageDetector');

const SUPPORTED_PLATFORMS: PlatformOSType[] = ['android'];

/**
 * A React hook for performing language detection using a MediaPipe LanguageDetector model.
 *
 * @param source The source of the model to be used for detection. This can be a local file path,
 *               a URI for a remote model, or a bundled asset path.
 * @param options Optional configuration options for the language detector.
 * @returns An object containing:
 *          - `detect`: An asynchronous function that takes a string `text` and performs language detection.
 *                      It returns a `LanguageDetectorResult` promise.
 *          - `data`: The latest `LanguageDetectorResult` from the `detect` function, or `null` if no detection has been performed yet.
 *          - `isLoading`: A boolean indicating whether the model is currently being loaded or initialized.
 *          - `error`: An `AistackError` object if an error occurred during model loading, initialization, or detection, otherwise `null`.
 * @throws {AistackError} If the hook is used on an unsupported platform.
 */
export function useLanguageDetector(
  source: ModelSource,
  options?: LanguageDetectorOptions
) {
  if (!SUPPORTED_PLATFORMS.includes(Platform.OS)) {
    throw new AistackError(
      `The 'useLanguageDetector' hook is not supported on ${Platform.OS}.`,
      'PLATFORM_NOT_SUPPORTED'
    );
  }

  const [data, setData] = useState<LanguageDetectorResult | null>(null);
  const {
    module: languageDetector,
    isLoading,
    error,
  } = useAistackModuleInternal(LanguageDetector, source, options);

  const detect = async (text: string) => {
    if (!languageDetector) {
      throw new AistackError(
        'LanguageDetector is not initialized.',
        'INVALID_INPUT'
      );
    }
    const result = await languageDetector.detect(text);
    setData(result);
    return result;
  };

  return { detect, data, isLoading, error };
}
