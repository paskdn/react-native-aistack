import { useAistackModuleInternal } from './internal';
import { NitroModules } from 'react-native-nitro-modules';
import type {
  TextEmbedder as TextEmbedderType,
  TextEmbedderOptions,
} from '../specs/TextEmbedder.nitro';
import { AistackError } from '../common/errors';
import type { ModelSource } from '../common/types';
import { Platform, type PlatformOSType } from 'react-native';

/**
 * Represents the native TextEmbedder module.
 * This is typically used internally by the `useTextEmbedder` hook.
 */
export const TextEmbedder =
  NitroModules.createHybridObject<TextEmbedderType>('TextEmbedder');

const SUPPORTED_PLATFORMS: PlatformOSType[] = ['android'];

/**
 * A React hook for performing text embedding and comparing semantic similarity of texts
 * using a MediaPipe TextEmbedder model.
 *
 * @param source The source of the model to be used for embedding. This can be a local file path,
 *               a URI for a remote model, or a bundled asset path.
 * @param options Optional configuration options for the text embedder.
 * @returns An object containing:
 *          - `embed`: An asynchronous function that takes a string `text` and returns its embedding as a `Promise<number[]>`.
 *          - `compare`: An asynchronous function that takes two strings `text1` and `text2` and returns their semantic similarity score as a `Promise<number>`.
 *          - `isLoading`: A boolean indicating whether the model is currently being loaded or initialized.
 *          - `error`: An `AistackError` object if an error occurred during model loading, initialization, embedding, or comparison, otherwise `null`.
 * @throws {AistackError} If the hook is used on an unsupported platform.
 */
export function useTextEmbedder(
  source: ModelSource,
  options?: TextEmbedderOptions
) {
  if (!SUPPORTED_PLATFORMS.includes(Platform.OS)) {
    throw new AistackError(
      `The 'useTextEmbedder' hook is not supported on ${Platform.OS}.`,
      'PLATFORM_NOT_SUPPORTED'
    );
  }

  const {
    module: textEmbedder,
    isLoading,
    error,
  } = useAistackModuleInternal(TextEmbedder, source, options);

  const embed = async (text: string): Promise<number[]> => {
    if (!textEmbedder) {
      throw new AistackError(
        'TextEmbedder is not initialized.',
        'INVALID_INPUT'
      );
    }
    return textEmbedder.embed(text);
  };

  const compare = async (text1: string, text2: string): Promise<number> => {
    if (!textEmbedder) {
      throw new AistackError(
        'TextEmbedder is not initialized.',
        'INVALID_INPUT'
      );
    }
    return textEmbedder.compare(text1, text2);
  };

  return {
    embed,
    compare,
    isLoading,
    error,
  };
}
