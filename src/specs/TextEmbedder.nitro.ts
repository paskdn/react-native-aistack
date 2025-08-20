import type { HybridObject } from 'react-native-nitro-modules';
import type { ModelSource } from '../common/types';

/**
 * Options for configuring the Text Embedder.
 */
export interface TextEmbedderOptions {
  /**
   * Whether to normalize the returned embedding with L2 norm.
   * Use this if the model does not already contain a native L2 normalization.
   */
  l2Normalize?: boolean;
  /**
   * Whether the returned embedding should be quantized to bytes.
   */
  quantize?: boolean;
}

/**
 * A native, stateful instance of the MediaPipe Text Embedder.
 * This object is responsible for loading a model and generating text embeddings.
 * It extends `HybridObject` for native module integration.
 */
export interface TextEmbedder extends HybridObject<{ android: 'kotlin' }> {
  /**
   * Initializes the text embedder with a specific model and configuration.
   * This method must be called before any other embedding methods.
   * @param source The source of the model to load (e.g., local file path, URI).
   * @param options Optional configuration for the embedder.
   * @returns A promise that resolves when the embedder is ready for use.
   */
  initialize(source: ModelSource, options?: TextEmbedderOptions): Promise<void>;

  /**
   * Releases the native resources associated with the text embedder instance.
   * This method must be called when the embedder is no longer needed to prevent memory leaks
   * and free up system resources.
   */
  unload(): void;

  /**
   * Embeds a piece of text into a vector.
   * @param text The text to embed.
   * @returns A promise that resolves with the embedding (an array of numbers).
   */
  embed(text: string): Promise<number[]>;

  /**
   * Computes the cosine similarity between two pieces of text.
   * @param text1 The first text.
   * @param text2 The second text.
   * @returns A promise that resolves with the cosine similarity score (number between -1 and 1).
   */
  compare(text1: string, text2: string): Promise<number>;
}
