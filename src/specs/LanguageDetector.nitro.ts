import type { HybridObject } from 'react-native-nitro-modules';
import type { ModelSource } from '../common/types';

/**
 * A single language prediction.
 */
export interface LanguagePrediction {
  /**
   * The IETF BCP 47 language code (e.g., "en", "es").
   */
  languageCode: string;
  /**
   * The confidence score of the prediction, from 0.0 to 1.0.
   */
  confidence: number;
}

/**
 * Options for configuring the Language Detector.
 */
export interface LanguageDetectorOptions {
  /**
   * The prediction score threshold that overrides the one provided in the model metadata (if any).
   * Results below this value are rejected.
   * @see https://ai.google.dev/edge/mediapipe/solutions/text/language_detector/android#configurations_options
   */
  scoreThreshold?: number;

  /**
   * The maximum number of top-scored language predictions to return.
   * If not set or less than 0, all available results will be returned.
   * @see https://ai.google.dev/edge/mediapipe/solutions/text/language_detector/android#configurations_options
   */
  maxResults?: number;

  /**
   * A list of language codes to allow.
   * If non-empty, predictions whose language code is not in this set will be filtered out.
   * Mutually exclusive with `categoryDenylist`.
   * @see https://ai.google.dev/edge/mediapipe/solutions/text/language_detector/android#configurations_options
   */
  categoryAllowlist?: string[];

  /**
   * A list of language codes to deny.
   * If non-empty, predictions whose language code is in this set will be filtered out.
   * Mutually exclusive with `categoryAllowlist`.
   * @see https://ai.google.dev/edge/mediapipe/solutions/text/language_detector/android#configurations_options
   */
  categoryDenylist?: string[];
}

/**
 * The result of a language detection task.
 */
export interface LanguageDetectorResult {
  /**
   * A list of detected languages, sorted by confidence in descending order.
   */
  languages: LanguagePrediction[];
}

/**
 * A native, stateful instance of the MediaPipe Language Detector.
 * This object is responsible for loading a model and running the language detection task.
 * It extends `HybridObject` for native module integration.
 */
export interface LanguageDetector extends HybridObject<{ android: 'kotlin' }> {
  /**
   * Initializes the language detector with a specific model and configuration.
   * This method must be called before any other detection methods.
   * @param source The source of the model to load (e.g., local file path, URI).
   * @param options Optional configuration for the detector.
   * @returns A promise that resolves when the detector is ready for use.
   */
  initialize(
    source: ModelSource,
    options?: LanguageDetectorOptions
  ): Promise<void>;

  /**
   * Releases the native resources associated with the language detector instance.
   * This method must be called when the detector is no longer needed to prevent memory leaks
   * and free up system resources.
   */
  unload(): void;

  /**
   * Performs language detection on the given input string.
   * @param text The text to analyze.
   * @returns A promise that resolves with the detection result (`LanguageDetectorResult`).
   */
  detect(text: string): Promise<LanguageDetectorResult>;
}
