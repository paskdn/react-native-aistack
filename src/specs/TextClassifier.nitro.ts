import type { HybridObject } from 'react-native-nitro-modules';
import type { Category } from '../common/types';
import type { ModelSource } from '../common/types';

/**
 * Options for configuring the Text Classifier.
 */
export interface TextClassifierOptions {
  /**
   * The maximum number of top-scored classification results to return.
   * If not set, all results will be returned.
   */
  maxResults?: number;

  /**
   * The locale to use for display names specified in the TFLite Model Metadata, if any.
   * Defaults to 'en'.
   * @see https://ai.google.dev/edge/mediapipe/solutions/text/text_classifier/android#configuration_options
   */
  displayNamesLocale?: string;

  /**
   * The minimum confidence score for a classification to be returned.
   * Results below this value are rejected.
   * @see https://ai.google.dev/edge/mediapipe/solutions/text/text_classifier/android#configuration_options
   */
  scoreThreshold?: number;

  /**
   * A list of category names to allow.
   * If non-empty, classification results whose category name is not in this list will be filtered out.
   * Mutually exclusive with `categoryDenylist`.
   * @see https://ai.google.dev/edge/mediapipe/solutions/text/text_classifier/android#configuration_options
   */
  categoryAllowlist?: string[];

  /**
   * A list of category names to deny.
   * If non-empty, classification results whose category name is in this list will be filtered out.
   * Mutually exclusive with `categoryAllowlist`.
   * @see https://ai.google.dev/edge/mediapipe/solutions/text/text_classifier/android#configuration_options
   */
  categoryDenylist?: string[];
}

/**
 * The result of a text classification task.
 */
export interface TextClassifierResult {
  /**
   * A list of classifications, sorted by score in descending order.
   */
  classifications: Category[];
}

/**
 * A native, stateful instance of the MediaPipe Text Classifier.
 * This object is responsible for loading a model and running the classification task.
 * It extends `HybridObject` for native module integration.
 */
export interface TextClassifier extends HybridObject<{ android: 'kotlin' }> {
  /**
   * Initializes the text classifier with a specific model and configuration.
   * This method must be called before any other classification methods.
   * @param source The source of the model to load (e.g., local file path, URI).
   * @param options Optional configuration for the classifier.
   * @returns A promise that resolves when the classifier is ready for use.
   */
  initialize(
    source: ModelSource,
    options?: TextClassifierOptions
  ): Promise<void>;

  /**
   * Releases the native resources associated with the text classifier instance.
   * This method must be called when the classifier is no longer needed to prevent memory leaks
   * and free up system resources.
   */
  unload(): void;

  /**
   * Performs text classification on the given input string.
   * @param text The text to classify.
   * @returns A promise that resolves with the classification result (`TextClassifierResult`).
   */
  classify(text: string): Promise<TextClassifierResult>;
}
