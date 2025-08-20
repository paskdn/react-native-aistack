import type { HybridObject } from 'react-native-nitro-modules';
import type {
  ModelSource,
  Category,
  AssetSource,
  ImagePreprocessingOptions,
  VisionRunningMode,
  Delegate,
} from '../common/types';

/**
 * Internal representation of Category[][] as a flat structure.
 * This is used to work around limitations in native module code generation for nested arrays.
 */
export interface InternalCategoryArray2D {
  /** A flattened array of all Category objects. */
  items: Category[];
  /** An array indicating the length of each sub-array in the original 2D structure. */
  lengths: number[];
}

/**
 * Options for configuring the Image Classifier.
 */
export interface ImageClassifierOptions {
  /**
   * The running mode of the image classifier. Defaults to `IMAGE`.
   * Only `IMAGE` mode is currently supported.
   */
  runningMode?: VisionRunningMode;

  /**
   * The hardware delegate to use for inference.
   * - CPU: CPU delegate for basic inference (more compatible)
   * - GPU: GPU delegate for hardware-accelerated inference (if available)
   * @default 'CPU'
   */
  delegate?: Delegate;

  /**
   * The locale to use for display names specified in the TFLite Model Metadata, if any.
   * @default 'en'
   */
  displayNamesLocale?: string;

  /**
   * The maximum number of top-scored classification results to return.
   * If not set or less than 0, all available results will be returned.
   */
  maxResults?: number;

  /**
   * The prediction score threshold that overrides the one provided in the model metadata (if any).
   * Results below this value are rejected.
   */
  scoreThreshold?: number;

  /**
   * A list of category names to allow.
   * If non-empty, classification results whose category name is not in this set will be filtered out.
   * Mutually exclusive with `categoryDenylist`.
   */
  categoryAllowlist?: string[];

  /**
   * A list of category names to deny.
   * If non-empty, classification results whose category name is in this set will be filtered out.
   * Mutually exclusive with `categoryAllowlist`.
   */
  categoryDenylist?: string[];
}

/**
 * The result of an image classification task.
 * This uses internal types to work around Nitrogen's nested array codegen bug.
 */
export interface ImageClassifierResult {
  /**
   * A list of classifications, sorted by score in descending order.
   * Internal representation as flat array instead of Category[][].
   */
  classifications: InternalCategoryArray2D;
}

/**
 * A native, stateful instance of the MediaPipe Image Classifier.
 * This object is responsible for loading a model and running the classification task.
 * It extends `HybridObject` for native module integration.
 */
export interface ImageClassifier extends HybridObject<{ android: 'kotlin' }> {
  /**
   * Initializes the image classifier with a specific model and configuration.
   * This method must be called before any other classification methods.
   * @param source The source of the model to load (e.g., local file path, URI).
   * @param options Optional configuration for the classifier.
   * @returns A promise that resolves when the classifier is ready for use.
   */
  initialize(
    source: ModelSource,
    options?: ImageClassifierOptions
  ): Promise<void>;

  /**
   * Releases the native resources associated with the image classifier instance.
   * This method must be called when the classifier is no longer needed to prevent memory leaks
   * and free up system resources.
   */
  unload(): void;

  /**
   * Performs image classification on the given image asset.
   * @param asset The image asset to classify (e.g., URI to an image file).
   * @param options Optional preprocessing options for the image asset before classification.
   * @returns A promise that resolves with the classification result (`ImageClassifierResult`).
   */
  classify(
    asset: AssetSource,
    options?: ImagePreprocessingOptions
  ): Promise<ImageClassifierResult>;
}
