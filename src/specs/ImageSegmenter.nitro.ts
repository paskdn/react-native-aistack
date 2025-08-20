import type { HybridObject } from 'react-native-nitro-modules';
import type {
  ModelSource,
  AssetSource,
  ImagePreprocessingOptions,
  VisionRunningMode,
  Delegate,
} from '../common/types';

/**
 * Options for configuring the Image Segmenter.
 */
export interface ImageSegmenterOptions {
  /**
   * Sets the running mode for the task. Image Segmenter has one mode:
   * - IMAGE: The mode for segmenting images on single image inputs.
   * @default 'IMAGE'
   */
  runningMode?: VisionRunningMode;

  /**
   * The delegate to use for inference. 'CPU' uses CPU inference, 'GPU' uses GPU acceleration.
   * Note: GPU delegate may not work on emulators. Use 'CPU' for emulator compatibility.
   * @default 'CPU'
   */
  delegate?: Delegate;

  /**
   * If set to `true`, the output includes a segmentation mask as a uint8 image,
   * where each pixel value indicates the winning category value.
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
   * The file path to the raw pixel data of the mask.
   * The interpretation depends on `outputCategoryMask` and `outputConfidenceMasks` options.
   */
  mask: string;
}

/**
 * The result of an image segmentation task.
 */
export interface ImageSegmenterResult {
  /**
   * A list of category masks, if `outputCategoryMask` is true in `ImageSegmenterOptions`.
   * Each mask is a `SegmentationMask` where pixel values indicate the winning category.
   */
  categoryMasks?: SegmentationMask[];

  /**
   * A list of confidence masks, if `outputConfidenceMasks` is true in `ImageSegmenterOptions`.
   * Each mask is a `SegmentationMask` where pixel values represent confidence scores.
   */
  confidenceMasks?: SegmentationMask[];
}

/**
 * A native, stateful instance of the MediaPipe Image Segmenter.
 * This object is responsible for loading a model and running the segmentation task.
 * It extends `HybridObject` for native module integration.
 *
 * Note: Image segmentation may have limited functionality on Android emulators
 * due to OpenGL/GPU limitations. For best results, test on physical devices.
 */
export interface ImageSegmenter extends HybridObject<{ android: 'kotlin' }> {
  /**
   * Initializes the image segmenter with a specific model and configuration.
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
    options?: ImageSegmenterOptions
  ): Promise<void>;

  /**
   * Releases the native resources associated with the image segmenter instance.
   * This method must be called when the segmenter is no longer needed to prevent memory leaks
   * and free up system resources.
   */
  unload(): void;

  /**
   * Performs image segmentation on the given image asset.
   * @param asset The image asset to segment (e.g., URI to an image file).
   * @param options Optional preprocessing options for the image asset before segmentation.
   * @returns A promise that resolves with the segmentation result (`ImageSegmenterResult`).
   */
  segment(
    asset: AssetSource,
    options?: ImagePreprocessingOptions
  ): Promise<ImageSegmenterResult>;
}
