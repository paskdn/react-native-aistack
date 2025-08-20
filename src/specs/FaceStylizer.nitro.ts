import type { HybridObject } from 'react-native-nitro-modules';
import type {
  ModelSource,
  AssetSource,
  ImagePreprocessingOptions,
  VisionRunningMode,
  Delegate,
} from '../common/types';

/**
 * Options for configuring the Face Stylizer.
 */
export interface FaceStylizerOptions {
  /**
   * The running mode of the face stylizer. Defaults to `IMAGE`.
   * Only `IMAGE` mode is currently supported.
   */
  runningMode?: VisionRunningMode;
  /**
   * The delegate to use for running the stylizer. Defaults to `CPU`.
   */
  delegate?: Delegate;
}

/**
 * The result of a face stylization task.
 */
export interface FaceStylizerResult {
  /**
   * The file path to the stylized image.
   * This will typically be a path to a temporary file in the app's cache directory.
   */
  stylizedImagePath: string;
}

/**
 * A native, stateful instance of the MediaPipe Face Stylizer.
 * This object is responsible for loading a model and running the stylization task.
 * It extends `HybridObject` for native module integration.
 */
export interface FaceStylizer extends HybridObject<{ android: 'kotlin' }> {
  /**
   * Initializes the face stylizer with a specific model and configuration.
   * This method must be called before any other stylization methods.
   * @param source The source of the model to load (e.g., local file path, URI).
   * @param options Optional configuration for the stylizer.
   * @returns A promise that resolves when the stylizer is ready for use.
   */
  initialize(source: ModelSource, options?: FaceStylizerOptions): Promise<void>;

  /**
   * Releases the native resources associated with the face stylizer instance.
   * This method must be called when the stylizer is no longer needed to prevent memory leaks
   * and free up system resources.
   */
  unload(): void;

  /**
   * Performs face stylization on the given image asset.
   * @param asset The image asset to stylize (e.g., URI to an image file).
   * @param options Optional preprocessing options for the image asset before stylization.
   * @returns A promise that resolves with the stylization result (`FaceStylizerResult`).
   */
  stylize(
    asset: AssetSource,
    options?: ImagePreprocessingOptions
  ): Promise<FaceStylizerResult>;
}
