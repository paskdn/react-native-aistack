import type { HybridObject } from 'react-native-nitro-modules';
import type {
  ModelSource,
  AssetSource,
  ImagePreprocessingOptions,
  VisionRunningMode,
} from '../common/types';

/**
 * Options for configuring the Image Embedder.
 */
export interface ImageEmbedderOptions {
  /**
   * Sets the running mode for the task. Image Embedder has one mode:
   * - IMAGE: The mode for embedding images on single image inputs.
   * @default 'IMAGE'
   */
  runningMode?: VisionRunningMode;

  /**
   * Whether to normalize the returned feature vector with L2 norm.
   * @default false
   */
  l2Normalize?: boolean;

  /**
   * Whether the returned embedding should be quantized to bytes via scalar quantization.
   * @default false
   */
  quantize?: boolean;
}

/**
 * Represents a single embedding result.
 */
export interface Embedding {
  /**
   * The feature vector itself, either in floating-point form or scalar-quantized.
   */
  floatEmbedding?: number[];
  /**
   * The quantized feature vector, if quantization is enabled.
   */
  quantizedEmbedding?: number[];

  /**
   * The index for the head that produced this embedding.
   */
  headIndex?: number;

  /**
   * The name of the head that produced this embedding.
   */
  headName?: string;
}

/**
 * The result of an image embedding task.
 */
export interface ImageEmbedderResult {
  /**
   * A list of embeddings generated from the input image.
   */
  embeddings: Embedding[];
}

/**
 * A native, stateful instance of the MediaPipe Image Embedder.
 * This object is responsible for loading a model and running the embedding task.
 * It extends `HybridObject` for native module integration.
 */
export interface ImageEmbedder extends HybridObject<{ android: 'kotlin' }> {
  /**
   * Initializes the image embedder with a specific model and configuration.
   * This method must be called before any other embedding methods.
   * @param source The source of the model to load (e.g., local file path, URI).
   * @param options Optional configuration for the embedder.
   * @returns A promise that resolves when the embedder is ready for use.
   */
  initialize(
    source: ModelSource,
    options?: ImageEmbedderOptions
  ): Promise<void>;

  /**
   * Releases the native resources associated with the image embedder instance.
   * This method must be called when the embedder is no longer needed to prevent memory leaks
   * and free up system resources.
   */
  unload(): void;

  /**
   * Performs image embedding on the given image asset.
   * @param asset The image asset to embed (e.g., URI to an image file).
   * @param options Optional preprocessing options for the image asset before embedding.
   * @returns A promise that resolves with the embedding result (`ImageEmbedderResult`).
   */
  embed(
    asset: AssetSource,
    options?: ImagePreprocessingOptions
  ): Promise<ImageEmbedderResult>;

  /**
   * Computes the cosine similarity between two embeddings.
   * @param embedding1 The first embedding.
   * @param embedding2 The second embedding.
   * @returns A promise that resolves with the cosine similarity score (number between -1 and 1).
   *          Returns an error if the embeddings are invalid or incompatible.
   */
  cosineSimilarity(
    embedding1: Embedding,
    embedding2: Embedding
  ): Promise<number>;
}
