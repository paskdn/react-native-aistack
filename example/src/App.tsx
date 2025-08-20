import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { HomeScreen } from './screens/HomeScreen';
import { TextClassifierScreen } from './screens/TextClassifierScreen';
import { LanguageDetectorScreen } from './screens/LanguageDetectorScreen';
import { TextEmbedderScreen } from './screens/TextEmbedderScreen';
import { LlmInferenceScreen } from './screens/LlmInferenceScreen';
import { AudioClassifierScreen } from './screens/AudioClassifierScreen';
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

import type { RootStackParamList } from './navigation';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Home"
        screenOptions={{
          headerStyle: {
            backgroundColor: '#007AFF',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      >
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{ title: 'AI Stack Features' }}
        />
        <Stack.Screen
          name="LlmInference"
          component={LlmInferenceScreen}
          options={{ title: 'LLM Inference Showcase' }}
        />
        <Stack.Screen
          name="TextClassifier"
          component={TextClassifierScreen}
          options={{ title: 'Text Classification' }}
        />
        <Stack.Screen
          name="LanguageDetector"
          component={LanguageDetectorScreen}
          options={{ title: 'Language Detection' }}
        />
        <Stack.Screen
          name="TextEmbedder"
          component={TextEmbedderScreen}
          options={{ title: 'Text Embedding' }}
        />
        <Stack.Screen
          name="AudioClassifier"
          component={AudioClassifierScreen}
          options={{ title: 'Audio Classification' }}
        />
        <Stack.Screen
          name="FaceLandmarker"
          component={FaceLandmarkerScreen}
          options={{ title: 'Face Landmark Detection' }}
        />
        <Stack.Screen
          name="FaceStylizer"
          component={FaceStylizerScreen}
          options={{ title: 'Face Stylization' }}
        />
        <Stack.Screen
          name="GestureRecognizer"
          component={GestureRecognizerScreen}
          options={{ title: 'Gesture Recognition' }}
        />
        <Stack.Screen
          name="HandLandmarker"
          component={HandLandmarkerScreen}
          options={{ title: 'Hand Landmark Detection' }}
        />
        <Stack.Screen
          name="ImageClassifier"
          component={ImageClassifierScreen}
          options={{ title: 'Image Classification' }}
        />
        <Stack.Screen
          name="ImageEmbedder"
          component={ImageEmbedderScreen}
          options={{ title: 'Image Embedding' }}
        />
        <Stack.Screen
          name="ImageSegmenter"
          component={ImageSegmenterScreen}
          options={{ title: 'Image Segmentation' }}
        />
        <Stack.Screen
          name="InteractiveSegmenter"
          component={InteractiveSegmenterScreen}
          options={{ title: 'Interactive Segmentation' }}
        />
        <Stack.Screen
          name="ObjectDetector"
          component={ObjectDetectorScreen}
          options={{ title: 'Object Detection' }}
        />
        <Stack.Screen
          name="FaceDetector"
          component={FaceDetectorScreen}
          options={{ title: 'Face Detection' }}
        />
        <Stack.Screen
          name="PoseLandmarker"
          component={PoseLandmarkerScreen}
          options={{ title: 'Pose Landmark Detection' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
