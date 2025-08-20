import type { HybridObject } from 'react-native-nitro-modules';
import type { ModelSource } from '../common/types';

type Backend = 'cpu' | 'gpu';

/**
 * Represents the token cost of a generation request.
 */
export interface TokenCost {
  /** The number of tokens in the input prompt. */
  promptTokenCount: number;
  /** The number of tokens in the generated completion. */
  completionTokenCount: number;
}

/**
 * Represents the performance statistics of a generation request.
 */
export interface PerformanceStats {
  /** Time to first token in milliseconds. */
  timeToFirstToken: number;
  /** Decode speed in tokens per second. */
  decodeSpeed: number;
  /** Prefill speed in tokens per second. */
  prefillSpeed: number;
  /** The token cost associated with the generation. */
  tokenCost: TokenCost;
}

/**
 * Represents the full result of a generation request.
 */
export interface GenerationResult {
  /** The generated response text. */
  response: string;
  /** The performance statistics for the generation. */
  stats: PerformanceStats;
}

/**
 * Represents an image source that can be passed from JavaScript to native code.
 * The path should be a URI that can be resolved on the native side (e.g., 'file:///...').
 */
export type ImageSource = {
  /** The URI path to the image. */
  path: string;
};

/**
 * Graph configuration options for advanced session behavior.
 */
export interface GraphOptions {
  /** Whether to include token cost calculator in the graph. */
  includeTokenCostCalculator?: boolean;
  /** Whether to enable vision modality for multimodal models. */
  enableVisionModality?: boolean;
}

/**
 * Vision model configuration options for multimodal models.
 */
export interface VisionModelOptions {
  /** Path to the vision encoder model. */
  encoderPath?: string;
  /** Path to the vision adapter model. */
  adapterPath?: string;
}

/**
 * Configuration options for the main LLM Inference engine.
 * @see https://ai.google.dev/edge/mediapipe/solutions/genai/llm_inference/android#configuration_options
 */
export interface LlmInferenceOptions {
  /** The maximum number of tokens for both input and output. Default: 512 */
  maxTokens?: number;

  /** The maximum number of top-k tokens to consider. Default: 40 */
  maxTopK?: number;

  /** The maximum number of images allowed in a multimodal prompt. Default: 0 */
  maxNumImages?: number;

  /** The supported LoRA ranks for this model. */
  supportedLoraRanks?: number[];

  /** Vision model configuration for multimodal models. */
  visionModelOptions?: VisionModelOptions;

  /** The preferred backend for inference ('cpu' or 'gpu'). */
  preferredBackend?: Backend;
}

/**
 * Prompt templates for customizing the conversation format.
 */
export interface PromptTemplates {
  /** Prefix for user messages. */
  userPrefix?: string;
  /** Suffix for user messages. */
  userSuffix?: string;
  /** Prefix for model responses. */
  modelPrefix?: string;
  /** Suffix for model responses. */
  modelSuffix?: string;
  /** Prefix for system messages. */
  systemPrefix?: string;
  /** Suffix for system messages. */
  systemSuffix?: string;
}

/**
 * Configuration options for an LLM Inference Session.
 * These options control the generation process for a specific conversation.
 */
export interface LlmSessionOptions {
  /** The number of tokens to consider at each step. Default: 40 */
  topK?: number;

  /** The top-p value for nucleus sampling. Default: 1.0 */
  topP?: number;

  /** The temperature for sampling (0.0 to 1.0). Default: 0.8 */
  temperature?: number;

  /** The random seed for sampling. Default: 0 */
  randomSeed?: number;

  /** The path to the LoRA model file (if different from engine default). */
  loraPath?: string;

  /** Graph configuration options for advanced behavior. */
  graphOptions?: GraphOptions;

  /** Constraint handle for guided generation. */
  constraintHandle?: number;

  /** Prompt templates for customizing conversation format. */
  promptTemplates?: PromptTemplates;
}

/**
 * A stateful session for conversational AI with an LLM.
 * Created from an LlmInference engine instance.
 * It extends `HybridObject` for native module integration.
 */
export interface LlmInferenceSession
  extends HybridObject<{ android: 'kotlin' }> {
  /**
   * Adds a text chunk to the current query. This builds up the prompt for the model.
   * @param text The text chunk to add to the query.
   */
  addQueryChunk(text: string): void;

  /**
   * Adds an image to the current conversation context for multimodal prompting.
   * @param image The image source to add.
   */
  addImage(image: ImageSource): void;

  /**
   * Generates a single, non-streaming response from the model using the current query.
   * @returns The full generated response.
   */
  generateResponse(): Promise<GenerationResult>;

  /**
   * Calculates the number of tokens in a given text.
   * @param text The text to be tokenized.
   * @returns The number of tokens.
   */
  sizeInTokens(text: string): number;

  /**
   * Clones the current session, creating a new session with the same state.
   * @returns A new LlmInferenceSession instance with the same state.
   */
  cloneSession(): LlmInferenceSession;

  /**
   * Updates the session options for this session.
   * @param options The new session options to apply.
   */
  updateSessionOptions(options: LlmSessionOptions): void;

  /**
   * Gets the current session options.
   * @returns The current session options.
   */
  getSessionOptions(): LlmSessionOptions;

  /**
   * Releases the native resources associated with this session.
   */
  close(): void;
}

/**
 * The main LLM Inference engine.
 * This object is responsible for loading a model and creating inference sessions.
 * It extends `HybridObject` for native module integration.
 */
export interface LlmInference extends HybridObject<{ android: 'kotlin' }> {
  /**
   * Initializes the LLM Inference engine with a model. Must be called before any other methods.
   * @param source The model source to load (e.g., local file path, URI).
   * @param options Optional configuration for the inference engine.
   * @returns A promise that resolves when the engine is ready for use.
   */
  initialize(source: ModelSource, options?: LlmInferenceOptions): Promise<void>;

  /**
   * Creates a new inference session for conversational AI.
   * @param options Optional configuration for the new session.
   * @returns A new `LlmInferenceSession` instance.
   */
  createSession(options?: LlmSessionOptions): LlmInferenceSession;

  /**
   * Performs a single, one-shot inference without creating a persistent session.
   * This is a convenience method that creates a temporary session internally.
   * @param prompt The input text to the model.
   * @returns A promise that resolves with the full generated response (`GenerationResult`).
   */
  generateResponse(prompt: string): Promise<GenerationResult>;

  /**
   * Calculates the number of tokens in a given text.
   * @param text The text to be tokenized.
   * @returns The number of tokens.
   */
  sizeInTokens(text: string): number;

  /**
   * Gets the SentencePiece processor handle for advanced tokenization operations.
   * @returns The processor handle.
   */
  getSentencePieceProcessorHandle(): number;

  /**
   * Releases all native resources associated with the inference engine and any active sessions.
   */
  unload(): void;
}
