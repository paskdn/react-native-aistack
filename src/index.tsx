// Hooks
export { useTextClassifier, TextClassifier } from './hooks/useTextClassifier';
export {
  useLanguageDetector,
  LanguageDetector,
} from './hooks/useLanguageDetector';
export { useTextEmbedder, TextEmbedder } from './hooks/useTextEmbedder';
export {
  useAudioClassifier,
  AudioClassifier,
} from './hooks/useAudioClassifier';
export { useLlmInference, LlmInference } from './hooks/useLlmInference';
export { useFaceDetector, FaceDetector } from './hooks/useFaceDetector';
export { useFaceLandmarker, FaceLandmarker } from './hooks/useFaceLandmarker';
export { useFaceStylizer, FaceStylizer } from './hooks/useFaceStylizer';
export {
  useGestureRecognizer,
  GestureRecognizer,
} from './hooks/useGestureRecognizer';
export { useHandLandmarker, HandLandmarker } from './hooks/useHandLandmarker';
export {
  useImageClassifier,
  ImageClassifier,
} from './hooks/useImageClassifier';
export { useImageEmbedder, ImageEmbedder } from './hooks/useImageEmbedder';
export { useImageSegmenter, ImageSegmenter } from './hooks/useImageSegmenter';
export {
  useInteractiveSegmenter,
  InteractiveSegmenter,
} from './hooks/useInteractiveSegmenter';
export { useObjectDetector, ObjectDetector } from './hooks/useObjectDetector';
export { usePoseLandmarker, PoseLandmarker } from './hooks/usePoseLandmarker';

// Common Types
export * from './common/errors';
export * from './common/types';

// Task-specific Types
export type {
  TextClassifierOptions,
  TextClassifierResult,
} from './specs/TextClassifier.nitro';
export type {
  LanguageDetectorOptions,
  LanguageDetectorResult,
  LanguagePrediction,
} from './specs/LanguageDetector.nitro';
export type { TextEmbedderOptions } from './specs/TextEmbedder.nitro';
export type {
  AudioClassifierOptions,
  AudioClassifierResult,
  ClassificationResult,
} from './specs/AudioClassifier.nitro';
export type { AudioRunningMode as RunningMode } from './common/types';
export type {
  LlmInferenceOptions,
  LlmSessionOptions,
  LlmInferenceSession,
  GraphOptions,
  VisionModelOptions,
  PromptTemplates,
  ImageSource,
} from './specs/LlmInference.nitro';
export type {
  FaceDetectorOptions,
  FaceDetectionResult,
  Detection,
  BoundingBox,
  NormalizedKeypoint,
} from './specs/FaceDetection.nitro';
export type {
  FaceLandmarkerOptions,
  NormalizedLandmark,
} from './specs/FaceLandmarker.nitro';
export type { FaceLandmarkerResult } from './common/result-converters';
export type {
  FaceStylizerOptions,
  FaceStylizerResult,
} from './specs/FaceStylizer.nitro';
export type {
  GestureRecognizerOptions,
  ClassifierOptions,
} from './specs/GestureRecognizer.nitro';
export type { GestureRecognizerResult } from './common/result-converters';
export type { HandLandmarkerOptions } from './specs/HandLandmarker.nitro';
export type { HandLandmarkerResult } from './common/result-converters';
export type { ImageClassifierOptions } from './specs/ImageClassifier.nitro';
export type { ImageClassifierResult } from './common/result-converters';
export type {
  ImageEmbedderOptions,
  ImageEmbedderResult,
  Embedding,
} from './specs/ImageEmbedder.nitro';
export type {
  ImageSegmenterOptions,
  ImageSegmenterResult,
  SegmentationMask,
} from './specs/ImageSegmenter.nitro';
export type {
  InteractiveSegmenterOptions,
  InteractiveSegmenterResult,
  RegionOfInterest,
} from './specs/InteractiveSegmenter.nitro';
export type {
  ObjectDetectorOptions,
  ObjectDetectorResult,
} from './specs/ObjectDetector.nitro';
export type {
  PoseLandmarkerOptions,
  NormalizedLandmark as PoseNormalizedLandmark,
} from './specs/PoseLandmarker.nitro';
export type { PoseLandmarkerResult } from './common/result-converters';

import { NitroModules } from 'react-native-nitro-modules';
import type { Aistack } from './specs/Aistack.nitro';

export const AistackHybridObject =
  NitroModules.createHybridObject<Aistack>('Aistack');

export function multiply(a: number, b: number): number {
  return AistackHybridObject.multiply(a, b);
}
