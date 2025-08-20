// Type definitions for react-native-aistack - Text Classification focused
import type { HybridObject } from 'react-native-nitro-modules';

/**
 * Common configuration for loading a model.
 */
export interface ModelConfig {
  /**
   * Local path to the TFLite model file.
   * Either `modelPath` or `modelUrl` must be provided.
   */
  modelPath?: string;
  /**
   * Remote URL to download the model from.
   * The model will be downloaded to a local cache directory.
   */
  modelUrl?: string;
  /**
   * Whether to use GPU acceleration for inference if available.
   * @default false
   */
  useGPU?: boolean;
  /**
   * Number of threads to use for CPU inference.
   * @default 2
   */
  numThreads?: number;
}

/**
 * Configuration options for the Text Classifier task.
 * These options match the native MediaPipe TextClassifier options.
 */
export interface TextClassifierOptions {
  /**
   * The locale to use for display names specified in the TFLite Model Metadata, if any.
   * @default 'en'
   */
  displayNamesLocale?: string;
  /**
   * The maximum number of top-scored classification results to return.
   * If -1, all results will be returned.
   * @default -1
   */
  maxResults?: number;
  /**
   * The minimum confidence score for a classification to be returned.
   * Overrides the score threshold specified in the model metadata.
   * @default 0.0
   */
  scoreThreshold?: number;
  /**
   * A list of category names to allow.
   * If non-empty, classification results whose category name is not in this list will be filtered out.
   * This option is mutually exclusive with `categoryDenylist`.
   */
  categoryAllowlist?: string[];
  /**
   * A list of category names to deny.
   * If non-empty, classification results whose category name is in this list will be filtered out.
   * This option is mutually exclusive with `categoryAllowlist`.
   */
  categoryDenylist?: string[];
}

/**
 * Represents the result of a model loading operation.
 */
export interface ModelLoadResult {
  /**
   * Whether the model was loaded successfully.
   */
  success: boolean;
  /**
   * A unique identifier for the loaded model.
   * This ID can be used to unload the model later.
   */
  modelId: string;
  /**
   * An error message if the model loading failed.
   */
  error?: string;
}

/**
 * Represents a single classification category from the Text Classifier.
 */
export interface ClassificationCategory {
  /**
   * The raw category name from the model's label file.
   */
  categoryName: string;
  /**
   * The confidence score for this category, typically between 0.0 and 1.0.
   */
  score: number;
  /**
   * The localized display name for the category, if available in the model metadata.
   */
  displayName?: string;
  /**
   * The index of the category in the model's output tensor.
   */
  index: number;
}

/**
 * The response from a text classification operation.
 */
export interface TextClassificationResponse {
  /**
   * A list of classification categories sorted by score.
   */
  results: ClassificationCategory[];
  /**
   * The time it took for the model to perform inference, in milliseconds.
   */
  inferenceTime: number;
}

/**
 * Represents a single language prediction from the Language Detector.
 */
export interface LanguagePrediction {
  /**
   * The IETF BCP 47 language code for the predicted language (e.g., "en", "fr").
   * See https://en.wikipedia.org/wiki/List_of_ISO_639-1_codes
   */
  languageCode: string;
  /**
   * The probability of the language prediction, from 0.0 to 1.0.
   */
  probability: number;
}

/**
 * The result of a language detection operation.
 */
export interface LanguageDetectorResult {
  /**
   * A list of language predictions, sorted by probability.
   */
  predictions: LanguagePrediction[];
  /**
   * The time it took for the model to perform inference, in milliseconds.
   */
  inferenceTime: number;
}

/**
 * Configuration options for the Language Detector task.
 * These options match the native MediaPipe LanguageDetector options.
 */
export interface LanguageDetectorOptions {
  /**
   * The maximum number of top-scored language predictions to return.
   * If -1, all results will be returned.
   * @default -1
   */
  maxResults?: number;
  /**
   * The minimum confidence score for a language prediction to be returned.
   * Overrides the score threshold specified in the model metadata.
   * @default 0.0
   */
  scoreThreshold?: number;
  /**
   * A list of language codes to allow.
   * If non-empty, predictions whose language code is not in this set will be filtered out.
   * This option is mutually exclusive with `categoryDenylist`.
   */
  categoryAllowlist?: string[];
  /**
   * A list of language codes to deny.
   * If non-empty, predictions whose language code is in this set will be filtered out.
   * This option is mutually exclusive with `categoryAllowlist`.
   */
  categoryDenylist?: string[];
}

/**
 * A numeric representation of text data, capturing its semantic meaning.
 * It is a high-dimensional feature vector of floating-point numbers.
 */
export type TextEmbedding = number[];

/**
 * Configuration options for the Text Embedder task.
 */
export interface TextEmbedderOptions {
  /**
   * Whether to normalize the returned feature vector with L2 norm.
   * Use this option only if the model does not already contain a native L2_NORMALIZATION TFLite Op.
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
 * The result of a text embedding operation.
 */
export interface TextEmbedderResult {
  /**
   * The embedding vector representing the input text.
   */
  embedding: TextEmbedding;
  /**
   * The time it took for the model to perform inference, in milliseconds.
   */
  inferenceTime: number;
}

/**
 * The result of comparing two text embeddings.
 */
export interface EmbeddingSimilarityResult {
  /**
   * The cosine similarity between two embeddings, ranging from -1.0 to 1.0.
   * A higher score indicates greater semantic similarity.
   */
  similarity: number;
  /**
   * The time it took to compute the similarity, in milliseconds.
   */
  inferenceTime: number;
}

/**
 * The main interface for the Aistack module, providing access to various on-device AI tasks.
 */
export interface Aistack extends HybridObject<{ android: 'kotlin' }> {
  /**
   * A simple test method to verify the module is working.
   * @param a The first number.
   * @param b The second number.
   * @returns The product of `a` and `b`.
   */
  multiply(a: number, b: number): number;

  // --- Model Management ---

  /**
   * Loads a model for a specific AI task.
   * @param modelType The type of model to load (e.g., 'text-classifier', 'language-detector').
   * @param config The configuration for loading the model.
   * @returns A promise that resolves with the result of the loading operation.
   */
  loadModel(modelType: string, config: ModelConfig): Promise<ModelLoadResult>;

  /**
   * Unloads a previously loaded model.
   * @param modelId The ID of the model to unload.
   * @returns A promise that resolves to `true` if the model was unloaded successfully.
   */
  unloadModel(modelId: string): Promise<boolean>;

  /**
   * Lists all currently loaded models.
   * @returns A promise that resolves with a record of model IDs to model types.
   */
  listLoadedModels(): Promise<Record<string, string>>;

  /**
   * Sets the default model for a given task type.
   * @param modelType The type of task (e.g., 'text-classifier').
   * @param modelId The ID of the model to set as default.
   * @returns A promise that resolves to `true` if the default was set successfully.
   */
  setDefaultModel(modelType: string, modelId: string): Promise<boolean>;

  /**
   * Downloads a model from a URL to a local file path.
   * @param url The URL to download the model from.
   * @param destinationPath The local path to save the model to.
   * @returns A promise that resolves to `true` if the download was successful.
   */
  downloadModel(url: string, destinationPath: string): Promise<boolean>;

  // --- Text Classification Task ---

  /**
   * Classifies the input text into a set of predefined categories.
   * @param text The text to classify.
   * @param options Configuration options for the classifier.
   * @returns A promise that resolves with the classification results.
   */
  classifyText(
    text: string,
    options?: TextClassifierOptions
  ): Promise<TextClassificationResponse>;

  /**
   * Initializes the text classifier with a specific model.
   * This is an alternative to using `loadModel` and `setDefaultModel`.
   * @param modelPath The local path to the text classifier model.
   * @param options Initial configuration options for the classifier.
   * @returns A promise that resolves to `true` if initialization is successful.
   */
  initTextClassifier(
    modelPath: string,
    options?: TextClassifierOptions
  ): Promise<boolean>;

  /**
   * Configures the text classifier with new options without re-initializing it.
   * @param options The new configuration options.
   * @returns A promise that resolves to `true` if configuration is successful.
   */
  configureTextClassifier(options: TextClassifierOptions): Promise<boolean>;

  /**
   * Checks if the text classifier is ready to be used.
   * @returns A promise that resolves to `true` if the classifier is ready.
   */
  isTextClassifierReady(): Promise<boolean>;

  // --- Language Detection Task ---

  /**
   * Detects the language of the input text.
   * @param text The text to analyze.
   * @param options Configuration options for the language detector.
   * @returns A promise that resolves with the language detection results.
   */
  detectLanguage(
    text: string,
    options?: LanguageDetectorOptions
  ): Promise<LanguageDetectorResult>;

  /**
   * Initializes the language detector with a specific model.
   * @param modelPath The local path to the language detector model.
   * @param options Initial configuration options for the detector.
   * @returns A promise that resolves to `true` if initialization is successful.
   */
  initLanguageDetector(
    modelPath: string,
    options?: LanguageDetectorOptions
  ): Promise<boolean>;

  /**
   * Configures the language detector with new options.
   * @param options The new configuration options.
   * @returns A promise that resolves to `true` if configuration is successful.
   */
  configureLanguageDetector(options: LanguageDetectorOptions): Promise<boolean>;

  /**
   * Checks if the language detector is ready to be used.
   * @returns A promise that resolves to `true` if the detector is ready.
   */
  isLanguageDetectorReady(): Promise<boolean>;

  // --- Text Embedding Task ---

  /**
   * Creates a numeric embedding for the input text to represent its semantic meaning.
   * @param text The text to embed.
   * @param options Configuration options for the text embedder.
   * @returns A promise that resolves with the text embedding result.
   */
  embedText(
    text: string,
    options?: TextEmbedderOptions
  ): Promise<TextEmbedderResult>;

  /**
   * Computes the cosine similarity between two text embeddings.
   * @param embedding1 The first text embedding.
   * @param embedding2 The second text embedding.
   * @returns A promise that resolves with the similarity result.
   */
  compareEmbeddings(
    embedding1: TextEmbedding,
    embedding2: TextEmbedding
  ): Promise<EmbeddingSimilarityResult>;

  /**
   * Initializes the text embedder with a specific model.
   * @param modelPath The local path to the text embedder model.
   * @param options Initial configuration options for the embedder.
   * @returns A promise that resolves to `true` if initialization is successful.
   */
  initTextEmbedder(
    modelPath: string,
    options?: TextEmbedderOptions
  ): Promise<boolean>;

  /**
   * Configures the text embedder with new options.
   * @param options The new configuration options.
   * @returns A promise that resolves to `true` if configuration is successful.
   */
  configureTextEmbedder(options: TextEmbedderOptions): Promise<boolean>;

  /**
   * Checks if the text embedder is ready to be used.
   * @returns A promise that resolves to `true` if the embedder is ready.
   */
  isTextEmbedderReady(): Promise<boolean>;
}
