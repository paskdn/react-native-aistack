import type { HybridObject } from 'react-native-nitro-modules';
import type {
  ModelSource,
  AssetSource,
  ImagePreprocessingOptions,
  Delegate,
} from '../common/types';

/**
 * Represents a normalized keypoint for region of interest.
 * Coordinates are typically normalized to [0.0, 1.0].
 */
export interface NormalizedKeypoint {
  /** The normalized x-coordinate of the keypoint. */
  x: number;
  /** The normalized y-coordinate of the keypoint. */
  y: number;
}

/**
 * Represents the region of interest for interactive segmentation.
 * This defines the area within an image that the user wants to segment.
 */
export interface RegionOfInterest {
  /**
   * A normalized keypoint representing a point within the region of interest.
   * This is typically used to indicate a foreground object.
   */
  point?: NormalizedKeypoint;
  // Bounding box and other ROI types can be added here if supported by MediaPipe
}

/**
 * Options for configuring the Interactive Image Segmenter.
 */
export interface InteractiveSegmenterOptions {
  /**
   * The delegate to use for inference. 'CPU' uses CPU inference, 'GPU' uses GPU acceleration.
   * Note: GPU delegate may not work on emulators. Use 'CPU' for emulator compatibility.
   * @default 'CPU'
   */
  delegate?: Delegate;

  /**
   * If set to `true`, the output includes a segmentation mask as a uint8 image,
   * where each pixel value indicates if the pixel is part of the object located at the area of interest.
   * Note: Either outputCategoryMask or outputConfidenceMasks must be true (not both).
   * @default false
   */
  outputCategoryMask?: boolean;

  /**
   * If set to `true`, the output includes a segmentation mask as a float value image,
   * where each float value represents the confidence score map of the category.
   * Note: Either outputCategoryMask or outputConfidenceMasks must be true (not both).
   * @default true
   */
  outputConfidenceMasks?: boolean;

  /**
   * The locale to use for display names provided in the metadata of the task's model, if available.
   * @default 'en'
   */
  displayNamesLocale?: string;
}

/**
 * Represents a segmentation mask.
 */
export interface SegmentationMask {
  /**
   * The width of the mask in pixels.
   */
  width: number;
  /**
   * The height of the mask in pixels.
   */
  height: number;
  /**
   * The raw pixel data of the mask as an AssetSource.
   * The interpretation depends on `outputCategoryMask` and `outputConfidenceMasks` options.
   */
  mask: AssetSource;
}

/**
 * The result of an interactive image segmentation task.
 */
export interface InteractiveSegmenterResult {
  /**
   * A list of category masks, if `outputCategoryMask` is true in `InteractiveSegmenterOptions`.
   * Each mask is a `SegmentationMask` where pixel values indicate the winning category.
   */
  categoryMasks?: SegmentationMask[];

  /**
   * A list of confidence masks, if `outputConfidenceMasks` is true in `InteractiveSegmenterOptions`.
   * Each mask is a `SegmentationMask` where pixel values represent confidence scores.
   */
  confidenceMasks?: SegmentationMask[];
}

/**
 * A native, stateful instance of the MediaPipe Interactive Image Segmenter.
 * This object is responsible for loading a model and running the segmentation task.
 * It extends `HybridObject` for native module integration.
 *
 * Note: Interactive segmentation may have limited functionality on Android emulators
 * due to OpenGL/GPU limitations. For best results, test on physical devices.
 */
export interface InteractiveSegmenter
  extends HybridObject<{ android: 'kotlin' }> {
  /**
   * Initializes the interactive image segmenter with a specific model and configuration.
   * This method must be called before any other segmentation methods.
   *
   * On emulators or devices with limited GPU support, initialization may fail
   * with GPU delegate. In such cases, try using CPU delegate instead.
   *
   * @param source The source of the model to load (e.g., local file path, URI).
   * @param options Optional configuration for the segmenter.
   * @returns A promise that resolves when the segmenter is ready for use.
   */
  initialize(
    source: ModelSource,
    options?: InteractiveSegmenterOptions
  ): Promise<void>;

  /**
   * Releases the native resources associated with the interactive image segmenter instance.
   * This method must be called when the segmenter is no longer needed to prevent memory leaks
   * and free up system resources.
   */
  unload(): void;

  /**
   * Performs interactive image segmentation on the given image asset.
   * @param asset The image asset to segment (e.g., URI to an image file).
   * @param regionOfInterest The region of interest to segment within the image.
   * @param options Optional preprocessing options for the image asset before segmentation.
   * @returns A promise that resolves with the segmentation result (`InteractiveSegmenterResult`).
   */
  segment(
    asset: AssetSource,
    regionOfInterest: RegionOfInterest,
    options?: ImagePreprocessingOptions
  ): Promise<InteractiveSegmenterResult>;
}
