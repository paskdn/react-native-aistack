import type { HybridObject } from 'react-native-nitro-modules';
import type {
  Category,
  ModelSource,
  AssetSource,
  ImagePreprocessingOptions,
  VisionRunningMode,
} from '../common/types';

/**
 * Options for configuring the Face Detector.
 */
export interface FaceDetectorOptions {
  /**
   * The running mode of the face detector. Defaults to `IMAGE`.
   * Only `IMAGE` mode is currently supported.
   */
  runningMode?: VisionRunningMode;

  /**
   * The minimum confidence score for the face detection to be considered successful.
   * @default 0.5
   */
  minDetectionConfidence?: number;

  /**
   * The minimum non-maximum-suppression threshold for face detection to be considered overlapped.
   * @default 0.3
   */
  minSuppressionThreshold?: number;
}

/**
 * Represents a detected face.
 */
export interface Detection {
  /**
   * A list of categories for the detected face, typically including a score.
   */
  categories: Category[];

  /**
   * The bounding box of the detected face (axis-aligned, integer-like values).
   */
  boundingBox: BoundingBox;

  /**
   * Normalized keypoints for the detected face, such as eyes, nose, mouth.
   * Optional to align with native which may omit keypoints on some platforms.
   */
  keypoints?: NormalizedKeypoint[];
}

/**
 * Represents the bounding box of a detected face or object.
 */
export interface BoundingBox {
  /** The x-coordinate of the top-left corner of the bounding box. */
  originX: number;
  /** The y-coordinate of the top-left corner of the bounding box. */
  originY: number;
  /** The width of the bounding box. */
  width: number;
  /** The height of the bounding box. */
  height: number;
}

/**
 * Represents a normalized keypoint, with coordinates typically ranging from 0.0 to 1.0.
 */
export interface NormalizedKeypoint {
  /** The normalized x-coordinate of the keypoint. */
  x: number;
  /** The normalized y-coordinate of the keypoint. */
  y: number;
  /** The normalized z-coordinate of the keypoint (optional, for 3D keypoints). */
  z?: number;
}

/**
 * The result of a face detection task.
 */
export interface FaceDetectionResult {
  /**
   * A list of detected faces, sorted by score in descending order.
   */
  detections: Detection[];
}

/**
 * A native, stateful instance of the MediaPipe Face Detector.
 * This object is responsible for loading a model and running the detection task.
 * It extends `HybridObject` for native module integration.
 */
export interface FaceDetector extends HybridObject<{ android: 'kotlin' }> {
  /**
   * Initializes the face detector with a specific model and configuration.
   * This method must be called before any other detection methods.
   * @param source The source of the model to load (e.g., local file path, URI).
   * @param options Optional configuration for the detector.
   * @returns A promise that resolves when the detector is ready for use.
   */
  initialize(source: ModelSource, options?: FaceDetectorOptions): Promise<void>;

  /**
   * Releases the native resources associated with the face detector instance.
   * This method must be called when the detector is no longer needed to prevent memory leaks
   * and free up system resources.
   */
  unload(): void;

  /**
   * Performs face detection on the given image asset.
   * @param asset The image asset to detect faces in (e.g., URI to an image file).
   * @param options Optional preprocessing options for the image asset before detection.
   * @returns A promise that resolves with the detection result (`FaceDetectionResult`).
   */
  detect(
    asset: AssetSource,
    options?: ImagePreprocessingOptions
  ): Promise<FaceDetectionResult>;
}
