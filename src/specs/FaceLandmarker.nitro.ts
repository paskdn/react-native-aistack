import type { HybridObject } from 'react-native-nitro-modules';
import type {
  ModelSource,
  AssetSource,
  ImagePreprocessingOptions,
  VisionRunningMode,
  Classifications,
  Matrix,
} from '../common/types';

/**
 * Represents a normalized landmark with optional depth (z) and visibility/presence.
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
 * Options for configuring the Face Landmarker.
 */
export interface FaceLandmarkerOptions {
  /**
   * The running mode of the face landmarker. Defaults to `IMAGE`.
   * Only `IMAGE` mode is currently supported.
   */
  runningMode?: VisionRunningMode;

  /**
   * The maximum number of faces that can be detected by the FaceLandmarker.
   * @default 1
   */
  numFaces?: number;

  /**
   * The minimum confidence score for the face detection to be considered successful.
   * @default 0.5
   */
  minFaceDetectionConfidence?: number;

  /**
   * The minimum confidence score of face presence score in the face landmark detection.
   * @default 0.5
   */
  minFacePresenceConfidence?: number;

  /**
   * The minimum confidence score for the face tracking to be considered successful.
   * @default 0.5
   */
  minTrackingConfidence?: number;

  /**
   * Whether Face Landmarker outputs face blendshapes.
   * @default false
   */
  outputFaceBlendshapes?: boolean;

  /**
   * Whether FaceLandmarker outputs the facial transformation matrix.
   * @default false
   */
  outputFacialTransformationMatrixes?: boolean;
}

/**
 * The result of a face landmark detection task.
 * This uses internal types to work around Nitrogen's nested array codegen bug.
 */
export interface FaceLandmarkerResult {
  /**
   * A list of face landmarks in image coordinates.
   * Internal representation as flat array instead of NormalizedLandmark[][].
   */
  faceLandmarks: InternalNormalizedLandmarkArray2D;

  /**
   * Face blendshape scores, if enabled in `FaceLandmarkerOptions`.
   */
  faceBlendshapes?: Classifications[] | null;

  /**
   * Facial transformation matrices, if enabled in `FaceLandmarkerOptions`.
   */
  facialTransformationMatrixes?: Matrix[] | null;
}

/**
 * A native, stateful instance of the MediaPipe Face Landmarker.
 * This object is responsible for loading a model and running the landmark detection task.
 * It extends `HybridObject` for native module integration.
 */
export interface FaceLandmarker extends HybridObject<{ android: 'kotlin' }> {
  /**
   * Initializes the face landmarker with a specific model and configuration.
   * This method must be called before any other detection methods.
   * @param source The source of the model to load (e.g., local file path, URI).
   * @param options Optional configuration for the landmarker.
   * @returns A promise that resolves when the landmarker is ready for use.
   */
  initialize(
    source: ModelSource,
    options?: FaceLandmarkerOptions
  ): Promise<void>;

  /**
   * Releases the native resources associated with the face landmarker instance.
   * This method must be called when the landmarker is no longer needed to prevent memory leaks
   * and free up system resources.
   */
  unload(): void;

  /**
   * Performs face landmark detection on the given image asset.
   * @param asset The image asset to process (e.g., URI to an image file).
   * @param options Optional preprocessing options for the image asset before detection.
   * @returns A promise that resolves with the detection result (`FaceLandmarkerResult`).
   */
  detect(
    asset: AssetSource,
    options?: ImagePreprocessingOptions
  ): Promise<FaceLandmarkerResult>;
}
