import { HomeScreen } from './screens/HomeScreen';
import { TextEmbedderScreen } from './screens/TextEmbedderScreen';
import { LanguageDetectorScreen } from './screens/LanguageDetectorScreen';
import { TextClassifierScreen } from './screens/TextClassifierScreen';
import { AudioClassifierScreen } from './screens/AudioClassifierScreen';
import { LlmInferenceScreen } from './screens/LlmInferenceScreen';

import { FaceDetectorScreen } from './screens/FaceDetectorScreen';
import { FaceLandmarkerScreen } from './screens/FaceLandmarkerScreen';
import { FaceStylizerScreen } from './screens/FaceStylizerScreen';
import { GestureRecognizerScreen } from './screens/GestureRecognizerScreen';
import { HandLandmarkerScreen } from './screens/HandLandmarkerScreen';
import { ImageClassifierScreen } from './screens/ImageClassifierScreen';
import { ImageEmbedderScreen } from './screens/ImageEmbedderScreen';
import { ImageSegmenterScreen } from './screens/ImageSegmenterScreen';
import { InteractiveSegmenterScreen } from './screens/InteractiveSegmenterScreen';
import { ObjectDetectorScreen } from './screens/ObjectDetectorScreen';
import { PoseLandmarkerScreen } from './screens/PoseLandmarkerScreen';

export type RootStackParamList = {
  Home: undefined;
  TextClassifier: undefined;
  AudioClassifier: undefined;
  LanguageDetector: undefined;
  TextEmbedder: undefined;
  LlmInference: undefined;
  FaceDetector: undefined;
  FaceLandmarker: undefined;
  FaceStylizer: undefined;
  GestureRecognizer: undefined;
  HandLandmarker: undefined;
  ImageClassifier: undefined;
  ImageEmbedder: undefined;
  ImageSegmenter: undefined;
  InteractiveSegmenter: undefined;
  ObjectDetector: undefined;
  PoseLandmarker: undefined;
};

export const SCREENS = {
  Home: {
    component: HomeScreen,
  },
  LlmInference: {
    title: 'LLM Inference',
    component: LlmInferenceScreen,
  },
  LanguageDetector: {
    title: 'Language Detector',
    component: LanguageDetectorScreen,
  },
  TextEmbedder: {
    title: 'Text Embedder',
    component: TextEmbedderScreen,
  },
  TextClassifier: {
    title: 'Text Classifier',
    component: TextClassifierScreen,
  },
  AudioClassifier: {
    title: 'Audio Classifier',
    component: AudioClassifierScreen,
  },
  FaceDetector: {
    title: 'Face Detector',
    component: FaceDetectorScreen,
  },
  FaceLandmarker: {
    title: 'Face Landmarker',
    component: FaceLandmarkerScreen,
  },
  FaceStylizer: {
    title: 'Face Stylizer',
    component: FaceStylizerScreen,
  },
  GestureRecognizer: {
    title: 'Gesture Recognizer',
    component: GestureRecognizerScreen,
  },
  HandLandmarker: {
    title: 'Hand Landmarker',
    component: HandLandmarkerScreen,
  },
  ImageClassifier: {
    title: 'Image Classifier',
    component: ImageClassifierScreen,
  },
  ImageEmbedder: {
    title: 'Image Embedder',
    component: ImageEmbedderScreen,
  },
  ImageSegmenter: {
    title: 'Image Segmenter',
    component: ImageSegmenterScreen,
  },
  InteractiveSegmenter: {
    title: 'Interactive Segmenter',
    component: InteractiveSegmenterScreen,
  },
  ObjectDetector: {
    title: 'Object Detector',
    component: ObjectDetectorScreen,
  },
  PoseLandmarker: {
    title: 'Pose Landmarker',
    component: PoseLandmarkerScreen,
  },
};
