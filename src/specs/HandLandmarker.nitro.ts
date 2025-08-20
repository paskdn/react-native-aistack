import type { HybridObject } from 'react-native-nitro-modules';
import type {
  ModelSource,
  Category,
  AssetSource,
  ImagePreprocessingOptions,
  VisionRunningMode,
  Delegate,
  Landmark,
} from '../common/types';

/**
 * Represents a normalized landmark with optional depth (z), visibility, and presence.
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
 * Options for configuring the Hand Landmarker.
 */
export interface HandLandmarkerOptions {
  /**
   * Sets the running mode for the task. Hand Landmarker has one mode:
   * - IMAGE: The mode for detecting landmarks on single image inputs.
   * @default 'IMAGE'
   */
  runningMode?: VisionRunningMode;

  /**
   * The hardware acceleration delegate. CPU is more compatible, GPU can be faster.
   * @default 'CPU'
   */
  delegate?: Delegate;

  /**
   * The maximum number of hands detected by the Hand landmark detector.
   * @default 1
   */
  numHands?: number;

  /**
   * The minimum confidence score for the hand detection to be considered successful in palm detection model.
   * @default 0.5
   */
  minHandDetectionConfidence?: number;

  /**
   * The minimum confidence score for the hand presence score in the hand landmark detection model.
   * @default 0.5
   */
  minHandPresenceConfidence?: number;

  /**
   * The minimum confidence score for the hand tracking to be considered successful.
   * @default 0.5
   */
  minTrackingConfidence?: number;
}

/**
 * The result of a hand landmark detection task.
 * This uses internal types to work around Nitrogen's nested array codegen bug.
 */
export interface HandLandmarkerResult {
  /**
   * Handedness of detected hands.
   * Internal representation as flat array instead of Category[][].
   */
  handedness: InternalCategoryArray2D;

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
 * A native, stateful instance of the MediaPipe Hand Landmarker.
 * This object is responsible for loading a model and running the landmark detection task.
 * It extends `HybridObject` for native module integration.
 */
export interface HandLandmarker extends HybridObject<{ android: 'kotlin' }> {
  /**
   * Initializes the hand landmarker with a specific model and configuration.
   * This method must be called before any other detection methods.
   * @param source The source of the model to load (e.g., local file path, URI).
   * @param options Optional configuration for the landmarker.
   * @returns A promise that resolves when the landmarker is ready for use.
   */
  initialize(
    source: ModelSource,
    options?: HandLandmarkerOptions
  ): Promise<void>;

  /**
   * Releases the native resources associated with the hand landmarker instance.
   * This method must be called when the landmarker is no longer needed to prevent memory leaks
   * and free up system resources.
   */
  unload(): void;

  /**
   * Performs hand landmark detection on the given image asset.
   * @param asset The image asset to process (e.g., URI to an image file).
   * @param options Optional preprocessing options for the image asset before detection.
   * @returns A promise that resolves with the detection result (`HandLandmarkerResult`).
   */
  detect(
    asset: AssetSource,
    options?: ImagePreprocessingOptions
  ): Promise<HandLandmarkerResult>;
}
