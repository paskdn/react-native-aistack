import type { HybridObject } from 'react-native-nitro-modules';
import type {
  ModelSource,
  AssetSource,
  AudioPreprocessingOptions,
  AudioRunningMode,
  Classifications,
} from '../common/types';

/**
 * Options for configuring the Audio Classifier.
 */
export interface AudioClassifierOptions {
  /**
   * The running mode of the audio classifier. Defaults to `AUDIO_CLIPS`.
   * Only `AUDIO_CLIPS` is currently supported.
   */
  runningMode?: AudioRunningMode;

  /**
   * The maximum number of top-scored classification results to return.
   * If not set, all results will be returned.
   */
  maxResults?: number;

  /**
   * The locale to use for display names specified in the TFLite Model Metadata, if any.
   * Defaults to 'en'.
   * @see https://ai.google.dev/edge/mediapipe/solutions/audio/audio_classifier/android#configuration_options
   */
  displayNamesLocale?: string;

  /**
   * The minimum confidence score for a classification to be returned.
   * Results below this value are rejected.
   * @see https://ai.google.dev/edge/mediapipe/solutions/audio/audio_classifier/android#configuration_options
   */
  scoreThreshold?: number;

  /**
   * A list of category names to allow.
   * If non-empty, classification results whose category name is not in this list will be filtered out.
   * Mutually exclusive with `categoryDenylist`.
   * @see https://ai.google.dev/edge/mediapipe/solutions/audio/audio_classifier/android#configuration_options
   */
  categoryAllowlist?: string[];

  /**
   * A list of category names to deny.
   * If non-empty, classification results whose category name is in this list will be filtered out.
   * Mutually exclusive with `categoryAllowlist`.
   * @see https://ai.google.dev/edge/mediapipe/solutions/audio/audio_classifier/android#configuration_options
   */
  categoryDenylist?: string[];
}

/**
 * Represents a single classification result with its own timestamp.
 * This corresponds to MediaPipe's ClassificationResult.
 */
export interface ClassificationResult {
  /**
   * A list of classification groups for this result.
   */
  classifications: Classifications[];
}

/**
 * The result of an audio classification task.
 */
export interface AudioClassifierResult {
  /**
   * A list of classification results, each potentially with its own timestamp.
   */
  classificationResults: ClassificationResult[];

  /**
   * The inference time in milliseconds for the entire classification operation.
   */
  inferenceTime?: number;
}

/**
 * A native, stateful instance of the MediaPipe Audio Classifier.
 * This object is responsible for loading a model and running the classification task.
 * It extends `HybridObject` for native module integration.
 */
export interface AudioClassifier extends HybridObject<{ android: 'kotlin' }> {
  /**
   * Initializes the audio classifier with a specific model and configuration.
   * This method must be called before any other classification methods.
   * @param source The source of the model to load (e.g., local file path, URI).
   * @param options Optional configuration for the classifier.
   * @returns A promise that resolves when the classifier is ready for use.
   */
  initialize(
    source: ModelSource,
    options?: AudioClassifierOptions
  ): Promise<void>;

  /**
   * Releases the native resources associated with the audio classifier instance.
   * This method must be called when the classifier is no longer needed to prevent memory leaks
   * and free up system resources.
   */
  unload(): void;

  /**
   * Performs audio classification on the given audio asset.
   * @param data The audio asset to classify (e.g., URI to an audio file).
   * @param options Optional preprocessing options for the audio asset before classification.
   * @returns A promise that resolves with the classification result (`AudioClassifierResult`).
   */
  classify(
    data: AssetSource,
    options?: AudioPreprocessingOptions
  ): Promise<AudioClassifierResult>;
}
