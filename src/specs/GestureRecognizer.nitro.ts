import type { HybridObject } from 'react-native-nitro-modules';
import type {
  ModelSource,
  Category,
  AssetSource,
  ImagePreprocessingOptions,
  VisionRunningMode,
  Landmark,
} from '../common/types';

/**
 * Represents a normalized landmark with optional depth (z).
 * Coordinates are typically normalized to [0.0, 1.0].
 */
export interface NormalizedLandmark {
  /** The normalized x-coordinate of the landmark. */
  x: number;
  /** The normalized y-coordinate of the landmark. */
  y: number;
  /** The normalized z-coordinate of the landmark (optional, for 3D landmarks). */
  z?: number;
}

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
 * Internal representation of NormalizedLandmark[][][] as a flat structure.
 * This is used to work around limitations in native module code generation for nested arrays.
 */
export interface InternalNormalizedLandmarkArray3D {
  /** A flattened array of all NormalizedLandmark objects. */
  items: NormalizedLandmark[];
  /** An array indicating the length of the outer arrays in the original 3D structure. */
  outerLengths: number[];
  /** An array indicating the length of the inner arrays in the original 3D structure. */
  innerLengths: number[];
}

/**
 * Internal representation of Landmark[][][] as a flat structure.
 * This is used to work around limitations in native module code generation for nested arrays.
 */
export interface InternalLandmarkArray3D {
  /** A flattened array of all Landmark objects. */
  items: Landmark[];
  /** An array indicating the length of the outer arrays in the original 3D structure. */
  outerLengths: number[];
  /** An array indicating the length of the inner arrays in the original 3D structure. */
  innerLengths: number[];
}

/**
 * Options for configuring classifier behavior.
 */
export interface ClassifierOptions {
  /**
   * The locale to use for display names specified in the TFLite Model Metadata, if any.
   * Defaults to 'en'.
   */
  displayNamesLocale?: string;
  /**
   * The maximum number of top-scored classification results to return.
   * If not set, all results will be returned.
   */
  maxResults?: number;
  /**
   * The minimum confidence score for a classification to be returned.
   * Results below this value are rejected.
   */
  scoreThreshold?: number;
  /**
   * A list of category names to allow.
   * If non-empty, classification results whose category name is not in this list will be filtered out.
   * Mutually exclusive with `categoryDenylist`.
   */
  categoryAllowlist?: string[];
  /**
   * A list of category names to deny.
   * If non-empty, classification results whose category name is in this list will be filtered out.
   * Mutually exclusive with `categoryAllowlist`.
   */
  categoryDenylist?: string[];
}

/**
 * Options for configuring the Gesture Recognizer.
 */
export interface GestureRecognizerOptions {
  /**
   * Sets the running mode for the task. Gesture Recognizer has one mode:
   * - IMAGE: The mode for recognizing gestures on single image inputs.
   * @default 'IMAGE'
   */
  runningMode?: VisionRunningMode;

  /**
   * The maximum number of hands that can be detected by the GestureRecognizer.
   * @default 1
   */
  numHands?: number;

  /**
   * The minimum confidence score for the hand detection to be considered successful in palm detection model.
   * @default 0.5
   */
  minHandDetectionConfidence?: number;

  /**
   * The minimum confidence score of hand presence score in the hand landmark detection model.
   * @default 0.5
   */
  minHandPresenceConfidence?: number;

  /**
   * The minimum confidence score for the hand tracking to be considered successful.
   * @default 0.5
   */
  minTrackingConfidence?: number;

  /**
   * Options for configuring the canned gestures classifier behavior.
   */
  cannedGesturesClassifierOptions?: ClassifierOptions;

  /**
   * Options for configuring the custom gestures classifier behavior.
   */
  customGesturesClassifierOptions?: ClassifierOptions;
}

/**
 * The result of a gesture recognition task.
 * This uses internal types to work around Nitrogen's nested array codegen bug.
 */
export interface GestureRecognizerResult {
  /**
   * Handedness of detected hands.
   * Internal representation as flat array instead of Category[][].
   */
  handedness: InternalCategoryArray2D;

  /**
   * Recognized gesture categories of the detected hands.
   * Internal representation as flat array instead of Category[][].
   */
  gestures: InternalCategoryArray2D;

  /**
   * Hand landmarks in image coordinates.
   * Internal representation as flat array instead of NormalizedLandmark[][][].
   */
  landmarks: InternalNormalizedLandmarkArray3D;

  /**
   * Hand landmarks in world coordinates.
   * Internal representation as flat array instead of Landmark[][][].
   */
  worldLandmarks: InternalLandmarkArray3D;
}

/**
 * A native, stateful instance of the MediaPipe Gesture Recognizer.
 * This object is responsible for loading a model and running the recognition task.
 * It extends `HybridObject` for native module integration.
 */
export interface GestureRecognizer extends HybridObject<{ android: 'kotlin' }> {
  /**
   * Initializes the gesture recognizer with a specific model and configuration.
   * This method must be called before any other recognition methods.
   * @param source The source of the model to load (e.g., local file path, URI).
   * @param options Optional configuration for the recognizer.
   * @returns A promise that resolves when the recognizer is ready for use.
   */
  initialize(
    source: ModelSource,
    options?: GestureRecognizerOptions
  ): Promise<void>;

  /**
   * Releases the native resources associated with the gesture recognizer instance.
   * This method must be called when the recognizer is no longer needed to prevent memory leaks
   * and free up system resources.
   */
  unload(): void;

  /**
   * Performs gesture recognition on the given image asset.
   * @param asset The image asset to process (e.g., URI to an image file).
   * @param options Optional preprocessing options for the image asset before recognition.
   * @returns A promise that resolves with the recognition result (`GestureRecognizerResult`).
   */
  recognize(
    asset: AssetSource,
    options?: ImagePreprocessingOptions
  ): Promise<GestureRecognizerResult>;
}
