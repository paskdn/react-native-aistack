import type { HybridObject } from 'react-native-nitro-modules';
import type {
  ModelSource,
  AssetSource,
  ImagePreprocessingOptions,
  VisionRunningMode,
  Delegate,
  Landmark,
  SegmentationMask,
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
  /** The likelihood of the landmark being visible within the image (0-1). */
  visibility?: number;
  /** The presence score of the landmark (0-1). */
  presence?: number;
}

/**
 * Internal representation of NormalizedLandmark[][] as a flat structure.
 * This is used to work around limitations in native module code generation for nested arrays.
 */
export interface InternalNormalizedLandmarkArray2D {
  /** A flattened array of all NormalizedLandmark objects. */
  items: NormalizedLandmark[];
  /** An array indicating the length of each sub-array in the original 2D structure. */
  lengths: number[];
}

/**
 * Internal representation of Landmark[][] as a flat structure.
 * This is used to work around limitations in native module code generation for nested arrays.
 */
export interface InternalLandmarkArray2D {
  /** A flattened array of all Landmark objects. */
  items: Landmark[];
  /** An array indicating the length of each sub-array in the original 2D structure. */
  lengths: number[];
}

/**
 * Options for configuring the Pose Landmarker.
 */
export interface PoseLandmarkerOptions {
  /**
   * Sets the running mode for the task. Pose Landmarker has one mode:
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
   * The maximum number of poses that can be detected by the Pose Landmarker.
   * @default 1
   */
  numPoses?: number;

  /**
   * The minimum confidence score for the pose detection to be considered successful.
   * @default 0.5
   */
  minPoseDetectionConfidence?: number;

  /**
   * The minimum confidence score of pose presence score in the pose landmark detection.
   * @default 0.5
   */
  minPosePresenceConfidence?: number;

  /**
   * The minimum confidence score for the pose tracking to be considered successful.
   * @default 0.5
   */
  minTrackingConfidence?: number;

  /**
   * Whether Pose Landmarker outputs a segmentation mask for the detected pose.
   * @default false
   */
  outputSegmentationMasks?: boolean;
}

/**
 * The result of a pose landmark detection task.
 * This uses internal types to work around Nitrogen's nested array codegen bug.
 */
export interface PoseLandmarkerResult {
  /**
   * Pose landmarks of detected poses.
   * Internal representation as flat array instead of NormalizedLandmark[][].
   */
  landmarks: InternalNormalizedLandmarkArray2D;

  /**
   * Pose landmarks in world coordinates of detected poses.
   * Internal representation as flat array instead of Landmark[][].
   */
  worldLandmarks: InternalLandmarkArray2D;

  /**
   * Segmentation masks for the detected poses, if enabled in `PoseLandmarkerOptions`.
   */
  segmentationMasks?: SegmentationMask[];
}

/**
 * A native, stateful instance of the MediaPipe Pose Landmarker.
 * This object is responsible for loading a model and running the landmark detection task.
 * It extends `HybridObject` for native module integration.
 */
export interface PoseLandmarker extends HybridObject<{ android: 'kotlin' }> {
  /**
   * Initializes the pose landmarker with a specific model and configuration.
   * This method must be called before any other detection methods.
   * @param source The source of the model to load (e.g., local file path, URI).
   * @param options Optional configuration for the landmarker.
   * @returns A promise that resolves when the landmarker is ready for use.
   */
  initialize(
    source: ModelSource,
    options?: PoseLandmarkerOptions
  ): Promise<void>;

  /**
   * Releases the native resources associated with the pose landmarker instance.
   * This method must be called when the landmarker is no longer needed to prevent memory leaks
   * and free up system resources.
   */
  unload(): void;

  /**
   * Performs pose landmark detection on the given image asset.
   * @param asset The image asset to process (e.g., URI to an image file).
   * @param options Optional preprocessing options for the image asset before detection.
   * @returns A promise that resolves with the detection result (`PoseLandmarkerResult`).
   */
  detect(
    asset: AssetSource,
    options?: ImagePreprocessingOptions
  ): Promise<PoseLandmarkerResult>;
}
