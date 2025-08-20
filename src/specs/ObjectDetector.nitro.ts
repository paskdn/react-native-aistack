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
 * Options for configuring the Object Detector.
 */
export interface ObjectDetectorOptions {
  /**
   * Sets the running mode for the task. Object Detector has one mode:
   * - IMAGE: The mode for detecting objects on single image inputs.
   * @default 'IMAGE'
   */
  runningMode?: VisionRunningMode;

  /**
   * The hardware delegate to use for inference.
   * - CPU: CPU delegate for basic inference
   * - GPU: GPU delegate for hardware-accelerated inference (if available)
   * @default 'CPU'
   */
  delegate?: Delegate;

  /**
   * The maximum number of top-scored detection results to return.
   * If not set, all results will be returned.
   */
  maxResults?: number;

  /**
   * The locale to use for display names specified in the TFLite Model Metadata, if any.
   * Defaults to 'en'.
   */
  displayNamesLocale?: string;

  /**
   * The minimum confidence score for a detection to be returned.
   * Results below this value are rejected.
   */
  scoreThreshold?: number;

  /**
   * A list of category names to allow.
   * If non-empty, detection results whose category name is not in this list will be filtered out.
   * Mutually exclusive with `categoryDenylist`.
   */
  categoryAllowlist?: string[];

  /**
   * A list of category names to deny.
   * If non-empty, detection results whose category name is in this list will be filtered out.
   * Mutually exclusive with `categoryAllowlist`.
   */
  categoryDenylist?: string[];
}

/**
 * Represents a detected object.
 */
export interface Detection {
  /**
   * A list of categories for the detected object.
   * Most models only predict one category per object.
   */
  categories: Category[];

  /**
   * The bounding box of the detected object.
   */
  boundingBox: BoundingBox;
}

/**
 * Represents the bounding box of a detected object.
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
 * The result of an object detection task.
 */
export interface ObjectDetectorResult {
  /**
   * A list of detections, sorted by score in descending order.
   */
  detections: Detection[];
}

/**
 * A native, stateful instance of the MediaPipe Object Detector.
 * This object is responsible for loading a model and running the detection task.
 * It extends `HybridObject` for native module integration.
 */
export interface ObjectDetector extends HybridObject<{ android: 'kotlin' }> {
  /**
   * Initializes the object detector with a specific model and configuration.
   * This method must be called before any other detection methods.
   * @param source The source of the model to load (e.g., local file path, URI).
   * @param options Optional configuration for the detector.
   * @returns A promise that resolves when the detector is ready for use.
   */
  initialize(
    source: ModelSource,
    options?: ObjectDetectorOptions
  ): Promise<void>;

  /**
   * Releases the native resources associated with the object detector instance.
   * This method must be called when the detector is no longer needed to prevent memory leaks
   * and free up system resources.
   */
  unload(): void;

  /**
   * Performs object detection on the given image asset.
   * @param asset The image asset to detect objects in (e.g., URI to an image file).
   * @param options Optional preprocessing options for the image asset before detection.
   * @returns A promise that resolves with the detection result (`ObjectDetectorResult`).
   */
  detect(
    asset: AssetSource,
    options?: ImagePreprocessingOptions
  ): Promise<ObjectDetectorResult>;
}
