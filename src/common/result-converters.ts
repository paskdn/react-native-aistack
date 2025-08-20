/**
 * User-facing helper functions for working with converted types
 *
 * These functions provide a clean API for users while internally handling
 * the flat array structure that works around Nitrogen's nested array bug.
 */

import type { NormalizedLandmark } from 'react-native-aistack';
import type {
  Category,
  Classifications,
  Matrix,
  Landmark,
  SegmentationMask,
} from '../common/types';
import type { InternalArray2D, InternalArray3D } from './internal-types';
import { ArrayConversions } from './internal-types';

/**
 * Result types with user-facing array structure
 */
export interface ImageClassifierResult {
  classifications: Category[][];
}

export interface GestureRecognizerResult {
  handedness: Category[][];
  gestures: Category[][];
  landmarks: NormalizedLandmark[][];
  worldLandmarks: Landmark[][];
}

export interface HandLandmarkerResult {
  handedness: Category[][];
  landmarks: NormalizedLandmark[][];
  worldLandmarks: Landmark[][];
}

export interface PoseLandmarkerResult {
  /** Pose landmarks of detected poses. */
  landmarks: NormalizedLandmark[][];
  /** Pose landmarks in world coordinates of detected poses. */
  worldLandmarks: Landmark[][];
  /** Segmentation masks for the detected poses. */
  segmentationMasks?: SegmentationMask[];
  /** Timestamp in milliseconds when the pose detection was performed. */
  timestampMs?: number;
}

export interface FaceLandmarkerResult {
  /** Detected face landmarks in normalized image coordinates. */
  faceLandmarks: NormalizedLandmark[][];
  /** Optional face blendshapes results. */
  faceBlendshapes: Classifications[];
  /** Optional facial transformation matrix. */
  facialTransformationMatrixes: Matrix[];
}

/**
 * Internal result types used by Nitrogen specs (flat array-based)
 */
export interface InternalImageClassifierResult {
  classifications: InternalArray2D<Category>;
}

export interface InternalGestureRecognizerResult {
  handedness: InternalArray2D<Category>;
  gestures: InternalArray2D<Category>;
  landmarks: InternalArray3D<NormalizedLandmark>;
  worldLandmarks: InternalArray3D<Landmark>;
}

export interface InternalHandLandmarkerResult {
  handedness: InternalArray2D<Category>;
  landmarks: InternalArray3D<NormalizedLandmark>;
  worldLandmarks: InternalArray3D<Landmark>;
}

export interface InternalPoseLandmarkerResult {
  landmarks: InternalArray2D<NormalizedLandmark>;
  worldLandmarks: InternalArray2D<Landmark>;
  segmentationMasks?: SegmentationMask[];
  timestampMs?: number;
}

export interface InternalFaceLandmarkerResult {
  faceLandmarks: InternalArray2D<NormalizedLandmark>;
  faceBlendshapes?: Classifications[] | null;
  facialTransformationMatrixes?: Matrix[] | null;
}

/**
 * Helper class for converting between internal and user-facing result types
 */
export class ResultConverters {
  /**
   * Convert internal ImageClassifierResult to user-facing format
   */
  static convertImageClassifierResult(
    internal: InternalImageClassifierResult
  ): ImageClassifierResult {
    return {
      classifications: ArrayConversions.from2D(internal.classifications),
    };
  }

  /**
   * Convert internal GestureRecognizerResult to user-facing format
   * Note: Converts from 3D internal structure to 2D user-facing structure
   * to match web MediaPipe API
   */
  static convertGestureRecognizerResult(
    internal: InternalGestureRecognizerResult
  ): GestureRecognizerResult {
    // Convert 3D arrays to 2D by flattening the first dimension
    const landmarks3D = ArrayConversions.from3D(internal.landmarks);
    const worldLandmarks3D = ArrayConversions.from3D(internal.worldLandmarks);

    return {
      handedness: ArrayConversions.from2D(internal.handedness),
      gestures: ArrayConversions.from2D(internal.gestures),
      landmarks: landmarks3D.length > 0 ? landmarks3D[0] || [] : [],
      worldLandmarks:
        worldLandmarks3D.length > 0 ? worldLandmarks3D[0] || [] : [],
    };
  }

  /**
   * Convert internal HandLandmarkerResult to user-facing format
   * Note: Converts from 3D internal structure to 2D user-facing structure
   * to match web MediaPipe API
   */
  static convertHandLandmarkerResult(
    internal: InternalHandLandmarkerResult
  ): HandLandmarkerResult {
    // Convert 3D arrays to 2D by flattening the first dimension
    const landmarks3D = ArrayConversions.from3D(internal.landmarks);
    const worldLandmarks3D = ArrayConversions.from3D(internal.worldLandmarks);

    return {
      handedness: ArrayConversions.from2D(internal.handedness),
      landmarks: landmarks3D.length > 0 ? landmarks3D[0] || [] : [],
      worldLandmarks:
        worldLandmarks3D.length > 0 ? worldLandmarks3D[0] || [] : [],
    };
  }

  /**
   * Convert internal PoseLandmarkerResult to user-facing format
   */
  static convertPoseLandmarkerResult(
    internal: InternalPoseLandmarkerResult
  ): PoseLandmarkerResult {
    return {
      landmarks: ArrayConversions.from2D(internal.landmarks),
      worldLandmarks: ArrayConversions.from2D(internal.worldLandmarks),
      segmentationMasks: internal.segmentationMasks,
      timestampMs: internal.timestampMs,
    };
  }

  /**
   * Convert internal FaceLandmarkerResult to user-facing format
   */
  static convertFaceLandmarkerResult(
    internal: InternalFaceLandmarkerResult
  ): FaceLandmarkerResult {
    return {
      faceLandmarks: ArrayConversions.from2D(internal.faceLandmarks),
      faceBlendshapes: internal.faceBlendshapes || [],
      facialTransformationMatrixes: internal.facialTransformationMatrixes || [],
    };
  }
}
