/**
 * Specifies the source of a model file from a remote URI.
 */
export interface UriModelSource {
  /** The URI of the model file. */
  uri: string;
  /** Optional HTTP headers to use when fetching the model. */
  headers?: Record<string, string>;
}

/**
 * Specifies the source of a model file from the app's bundle (e.g., Android assets).
 */
export interface BundleModelSource {
  /** The path to the model file within the app bundle. */
  bundle: string;
}

/**
 * Specifies the source of a model file from a local file path.
 */
export interface FilePathModelSource {
  /** The absolute path to the model file on the device's file system. */
  filePath: string;
}

/**
 * Specifies the source of a model file. It can be a remote URI (`UriModelSource`),
 * an app bundle resource (`BundleModelSource`), or a local file path (`FilePathModelSource`).
 */
export type ModelSource =
  | UriModelSource
  | BundleModelSource
  | FilePathModelSource;

/**
 * Represents a single classification category. This is a common structure
 * used by various classification tasks.
 */
export interface Category {
  /** The index of the category. */
  index: number;
  /** The score (confidence) of the category, typically between 0 and 1. */
  score: number;
  /** The human-readable display name of the category. */
  displayName: string;
  /** The machine-readable name of the category. */
  categoryName: string;
}

/**
 * Specifies the source of an asset file from a remote URI.
 */
export interface UriAssetSource {
  /** The URI of the asset file. */
  uri: string;
  /** Optional HTTP headers to use when fetching the asset. */
  headers?: Record<string, string>;
}

/**
 * Specifies the source of an asset file from the app's bundle (e.g., Android assets).
 */
export interface BundleAssetSource {
  /** The path to the asset file within the app bundle. */
  bundle: string;
}

/**
 * Specifies the source of an asset file from a local file path.
 */
export interface FilePathAssetSource {
  /** The absolute path to the asset file on the device's file system. */
  filePath: string;
}

/**
 * Specifies the source of an asset file. It can be a remote URI (`UriAssetSource`),
 * an app bundle resource (`BundleAssetSource`), or a local file path (`FilePathAssetSource`).
 */
export type AssetSource =
  | UriAssetSource
  | BundleAssetSource
  | FilePathAssetSource;

/**
 * Preprocessing options for image assets.
 */
export interface ImagePreprocessingOptions {
  /**
   * Optional. The maximum width to resize the image to. If the image's width exceeds this value,
   * it will be resized while maintaining aspect ratio. Useful to prevent Out-Of-Memory (OOM) errors
   * with very large images.
   */
  maxWidth?: number;
  /**
   * Optional. The maximum height to resize the image to. If the image's height exceeds this value,
   * it will be resized while maintaining aspect ratio. Useful to prevent Out-Of-Memory (OOM) errors
   * with very large images.
   */
  maxHeight?: number;
}

/**
 * Preprocessing options for audio assets.
 */
export interface AudioPreprocessingOptions {
  /**
   * Optional. The target sample rate for the audio. If the audio's sample rate differs,
   * it will be resampled to this value. Useful for ensuring compatibility with models
   * that expect a specific sample rate.
   */
  sampleRate?: number;
}

/**
 * Represents the running mode for MediaPipe Vision tasks.
 * Currently, only `IMAGE` mode (static image processing) is fully supported.
 * `DEFAULT` is an alias for `IMAGE` in this context.
 */
export type VisionRunningMode = 'IMAGE' | 'DEFAULT';

/**
 * Represents the running mode for MediaPipe Audio tasks.
 * Currently, only `AUDIO_CLIPS` mode (processing of audio clips) is fully supported.
 * `DEFAULT` is an alias for `AUDIO_CLIPS` in this context.
 */
export type AudioRunningMode = 'AUDIO_CLIPS' | 'DEFAULT';

/**
 * Represents the delegate for MediaPipe tasks, determining the execution environment.
 * `CPU` offers broader compatibility, while `GPU` can provide significantly faster
 * performance on supported devices.
 */
export type Delegate = 'CPU' | 'GPU';

/**
 * Numeric constant representing the CPU delegate.
 */
export const DELEGATE_CPU = 0;
/**
 * Numeric constant representing the GPU delegate.
 */
export const DELEGATE_GPU = 1;

/**
 * Landmark represents a point in 3D space with x, y, z coordinates. The
 * landmark coordinates are in meters. z represents the landmark depth,
 * and the smaller the value the closer the world landmark is to the camera.
 * Matches the web MediaPipe API interface.
 */
export interface Landmark {
  /** The x-coordinate of the landmark. */
  x: number;
  /** The y-coordinate of the landmark. */
  y: number;
  /** The z-coordinate of the landmark. */
  z: number;
  /** The likelihood of the landmark being visible within the image (0-1). */
  visibility: number;
}

/**
 * Classification results for a given classifier head.
 * Matches the web MediaPipe API interface.
 */
export interface Classifications {
  /**
   * The array of predicted categories, usually sorted by descending scores,
   * e.g., from high to low probability.
   */
  categories: Category[];
  /**
   * The index of the classifier head these categories refer to. This is
   * useful for multi-head models.
   */
  headIndex: number;
  /**
   * The name of the classifier head, which is the corresponding tensor
   * metadata name. Defaults to an empty string if there is no such metadata.
   */
  headName: string;
}

/**
 * A two-dimensional matrix.
 * Matches the web MediaPipe API interface.
 */
export interface Matrix {
  /** The number of rows in the matrix. */
  rows: number;
  /** The number of columns in the matrix. */
  columns: number;
  /** The values of the matrix as a flattened one-dimensional array (row-major order). */
  data: number[];
}

/**
 * Represents a segmentation mask, typically used in image segmentation and pose detection tasks.
 */
export interface SegmentationMask {
  /**
   * The width of the segmentation mask in pixels.
   */
  width: number;
  /**
   * The height of the segmentation mask in pixels.
   */
  height: number;
  /**
   * The file path to the raw pixel data of the mask. This can be used to reconstruct the mask image.
   */
  mask: string;
}

/**
 * Default confidence threshold for pose detection.
 */
export const DEFAULT_POSE_DETECTION_CONFIDENCE = 0.5;
/**
 * Default confidence threshold for pose tracking.
 */
export const DEFAULT_POSE_TRACKING_CONFIDENCE = 0.5;
/**
 * Default confidence threshold for pose presence.
 */
export const DEFAULT_POSE_PRESENCE_CONFIDENCE = 0.5;
/**
 * Default number of poses to detect.
 */
export const DEFAULT_NUM_POSES = 1;
