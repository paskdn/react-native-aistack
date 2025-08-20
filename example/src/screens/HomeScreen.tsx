import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation';

type Feature = {
  name: string;
  screen: keyof RootStackParamList;
};

type FeatureCategory = {
  title: string;
  icon: string;
  features: Feature[];
};

const FEATURE_CATEGORIES: FeatureCategory[] = [
  {
    title: 'Generative AI Tasks',
    icon: '🤖',
    features: [
      {
        name: 'LLM Inference',
        screen: 'LlmInference',
      },
      // Future features to implement:
      // { name: 'Retrieval Augmented Generation (RAG)', screen: 'RAG' },
      // { name: 'Function Calling', screen: 'FunctionCalling' },
      // { name: 'Image Generation', screen: 'ImageGeneration' },
    ],
  },
  {
    title: 'Vision Tasks',
    icon: '👁️',
    features: [
      {
        name: 'Object Detection',
        screen: 'ObjectDetector',
      },
      {
        name: 'Image Classification',
        screen: 'ImageClassifier',
      },
      {
        name: 'Image Segmentation',
        screen: 'ImageSegmenter',
      },
      {
        name: 'Interactive Segmentation',
        screen: 'InteractiveSegmenter',
      },
      {
        name: 'Gesture Recognition',
        screen: 'GestureRecognizer',
      },
      {
        name: 'Hand Landmark Detection',
        screen: 'HandLandmarker',
      },
      {
        name: 'Image Embedding',
        screen: 'ImageEmbedder',
      },
      {
        name: 'Face Detection',
        screen: 'FaceDetector',
      },
      {
        name: 'Face Landmark Detection',
        screen: 'FaceLandmarker',
      },
      {
        name: 'Pose Landmark Detection',
        screen: 'PoseLandmarker',
      },
      // Future features to implement:
      // {
      //   name: 'Face Stylization',
      //   screen: 'FaceStylizer',
      // },
      // { name: 'Holistic Landmark Detection', screen: 'HolisticLandmarker' },
    ],
  },
  {
    title: 'Text Tasks',
    icon: '📝',
    features: [
      {
        name: 'Text Classification',
        screen: 'TextClassifier',
      },
      {
        name: 'Language Detection',
        screen: 'LanguageDetector',
      },
      {
        name: 'Text Embedding',
        screen: 'TextEmbedder',
      },
    ],
  },
  {
    title: 'Audio Tasks',
    icon: '🎵',
    features: [
      {
        name: 'Audio Classification',
        screen: 'AudioClassifier',
      },
    ],
  },
];

type HomeScreenProps = NativeStackScreenProps<RootStackParamList, 'Home'>;

export function HomeScreen({ navigation }: HomeScreenProps) {
  const renderCategory = (category: FeatureCategory) => (
    <View key={category.title} style={styles.categoryContainer}>
      <Text style={styles.categoryTitle}>
        {category.icon} {category.title}
      </Text>
      {category.features.map((feature) => (
        <TouchableOpacity
          key={feature.name}
          style={styles.itemContainer}
          onPress={() => navigation.navigate(feature.screen)}
        >
          <Text style={styles.itemText}>{feature.name}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>🚀 Aistack Features</Text>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {FEATURE_CATEGORIES.map(renderCategory)}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5FCFF',
    padding: 20,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 20,
    color: '#333',
  },
  scrollView: {
    flex: 1,
  },
  categoryContainer: {
    marginBottom: 24,
  },
  categoryTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
    paddingLeft: 4,
  },
  itemContainer: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    marginVertical: 4,
    marginLeft: 8,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },
  itemText: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '500',
  },
});
