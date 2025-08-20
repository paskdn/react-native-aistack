import { useAistackModuleInternal } from './internal';
import { NitroModules } from 'react-native-nitro-modules';
import type {
  TextClassifier as TextClassifierType,
  TextClassifierOptions,
  TextClassifierResult,
} from '../specs/TextClassifier.nitro';
import type { ModelSource } from '../common/types';
import { AistackError } from '../common/errors';
import { useState } from 'react';

/**
 * Represents the native TextClassifier module.
 * This is typically used internally by the `useTextClassifier` hook.
 */
export const TextClassifier =
  NitroModules.createHybridObject<TextClassifierType>('TextClassifier');

/**
 * A React hook for performing text classification using a MediaPipe TextClassifier model.
 *
 * @param source The source of the model to be used for classification. This can be a local file path,
 *               a URI for a remote model, or a bundled asset path.
 * @param options Optional configuration options for the text classifier, such as delegate (CPU/GPU)
 *                or score threshold.
 * @returns An object containing:
 *          - `classify`: An asynchronous function that takes a string `text` and performs classification.
 *                        It returns a `TextClassifierResult` promise.
 *          - `data`: The latest `TextClassifierResult` from the `classify` function, or `null` if no classification has been performed yet.
 *          - `isLoading`: A boolean indicating whether the model is currently being loaded or initialized.
 *          - `error`: An `AistackError` object if an error occurred during model loading, initialization, or classification, otherwise `null`.
 */
export function useTextClassifier(
  source: ModelSource,
  options?: TextClassifierOptions
) {
  const [data, setData] = useState<TextClassifierResult | null>(null);
  const {
    module: textClassifier,
    isLoading,
    error,
  } = useAistackModuleInternal(TextClassifier, source, options);

  const classify = async (text: string) => {
    if (!textClassifier) {
      throw new AistackError(
        'TextClassifier is not initialized.',
        'INVALID_INPUT'
      );
    }
    const result = await textClassifier.classify(text);
    setData(result);
    return result;
  };

  return { classify, data, isLoading, error };
}
