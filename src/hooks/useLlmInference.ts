import { useAistackModuleInternal } from './internal';
import { NitroModules } from 'react-native-nitro-modules';
import type {
  LlmInference as LlmInferenceType,
  LlmInferenceOptions,
} from '../specs/LlmInference.nitro';
import type { ModelSource } from '../common/types';
import { AistackError } from '../common/errors';
import { Platform, type PlatformOSType } from 'react-native';

/**
 * Represents the native LlmInference module.
 * This is typically used internally by the `useLlmInference` hook.
 */
export const LlmInference =
  NitroModules.createHybridObject<LlmInferenceType>('LlmInference');

const SUPPORTED_PLATFORMS: PlatformOSType[] = ['android'];

/**
 * A React hook for performing large language model (LLM) inference using a MediaPipe LLM model.
 *
 * @param source The source of the LLM model to be loaded. This can be a local file path,
 *               a URI for a remote model, or a bundled asset path.
 * @param options Optional configuration options for the LLM inference engine.
 * @returns An object containing:
 *          - `llmInference`: The initialized LLM inference engine instance (`LlmInferenceType`), or `null` if not yet initialized.
 *          - `isLoading`: A boolean indicating whether the model is currently being loaded or initialized.
 *          - `error`: An `AistackError` object if an error occurred during model loading or initialization, otherwise `null`.
 * @throws {AistackError} If the hook is used on an unsupported platform.
 */
export function useLlmInference(
  source: ModelSource,
  options?: LlmInferenceOptions
): {
  llmInference: LlmInferenceType | null;
  isLoading: boolean;
  error: AistackError | null;
} {
  if (!SUPPORTED_PLATFORMS.includes(Platform.OS)) {
    throw new AistackError(
      `The 'useLlmInference' hook is not supported on ${Platform.OS}.`,
      'PLATFORM_NOT_SUPPORTED'
    );
  }

  const {
    module: llmInference,
    isLoading,
    error,
  } = useAistackModuleInternal(LlmInference, source, options);

  return {
    llmInference,
    isLoading,
    error,
  };
}
