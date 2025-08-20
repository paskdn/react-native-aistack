import { useState, useMemo } from 'react';
import { Text, View, TouchableOpacity, Alert, Image } from 'react-native';
import { useImageEmbedder, type Embedding } from 'react-native-aistack';
import { useCycle } from '../hooks/useCycle';
import { Button } from '../components/common/Button';
import { ErrorDisplay } from '../components/common/ErrorDisplay';
import { LoadingDisplay } from '../components/common/LoadingDisplay';
import { Result } from '../components/common/Result';
import { Screen } from '../components/common/Screen';
import { Section } from '../components/common/Section';
import { Title, Subtitle } from '../components/common/Titles';
import { commonStyles as styles } from '../components/common/styles';

const imageExamples = [
  {
    name: 'dog.jpg',
    uri: 'https://assets.codepen.io/9177687/dog_flickr_publicdomain.jpeg',
  },
  {
    name: 'cat.jpg',
    uri: 'https://assets.codepen.io/9177687/cat_flickr_publicdomain.jpeg',
  },
];

export function ImageEmbedderScreen() {
  const { current: currentExample } = useCycle(imageExamples);
  const [currentEmbedding, setCurrentEmbedding] = useState<Embedding | null>(
    null
  );
  const [previousEmbedding, setPreviousEmbedding] = useState<Embedding | null>(
    null
  );
  const [similarity, setSimilarity] = useState<number | null>(null);
  const [currentIndex] = useState(0);
  const [comparisonMode, setComparisonMode] = useState<'same' | 'different'>(
    'different'
  );

  const previousIndex =
    (currentIndex - 1 + imageExamples.length) % imageExamples.length;
  const previousExample = imageExamples[previousIndex]!;

  const leftImage =
    comparisonMode === 'same' ? currentExample : previousExample;
  const rightImage = currentExample;

  const { embed, cosineSimilarity, isLoading, error } = useImageEmbedder(
    {
      uri: 'https://storage.googleapis.com/mediapipe-models/image_embedder/mobilenet_v3_small/float32/latest/mobilenet_v3_small.tflite',
    },
    {
      l2Normalize: true,
      quantize: false,
      runningMode: 'IMAGE',
    }
  );

  const handleEmbedLeftImage = async () => {
    try {
      const result = await embed({ uri: leftImage.uri });
      if (result) {
        if (result.embeddings[0]) {
          setPreviousEmbedding(result.embeddings[0]);
        }
      }
    } catch (e) {
      console.error('Image embedding error:', e);
      Alert.alert(
        'Embedding Error',
        'Failed to embed image. Please try again.'
      );
    }
  };

  const handleEmbedRightImage = async () => {
    try {
      const result = await embed({ uri: rightImage.uri });
      if (result) {
        if (result.embeddings[0]) {
          setCurrentEmbedding(result.embeddings[0]);
        }
      }
    } catch (e) {
      console.error('Image embedding error:', e);
      Alert.alert(
        'Embedding Error',
        'Failed to embed image. Please try again.'
      );
    }
  };

  const handleCompareEmbeddings = async () => {
    if (currentEmbedding && previousEmbedding) {
      const sim = await cosineSimilarity(currentEmbedding, previousEmbedding);
      setSimilarity(sim);
    } else {
      const missingLeft = !previousEmbedding;
      const missingRight = !currentEmbedding;
      let message = 'Please embed ';

      if (missingLeft && missingRight) {
        message += 'both images to compare.';
      } else if (missingLeft) {
        message += 'the left image to compare.';
      } else {
        message += 'the right image to compare.';
      }

      Alert.alert('Missing Embeddings', message);
    }
  };

  const errorMessage = useMemo(() => {
    if (!error) return null;
    return `Error: ${error.message} (Code: ${error.code})`;
  }, [error]);

  return (
    <Screen>
      <Section>
        <Title>Image Embedding</Title>
        <Subtitle>Model: MobileNet V3 Small (URL-based)</Subtitle>

        <View style={styles.toggleContainer}>
          <Text style={styles.toggleLabel}>Comparison Mode:</Text>
          <View style={styles.toggleButtons}>
            <TouchableOpacity
              style={[
                styles.toggleButton,
                comparisonMode === 'different' && styles.toggleButtonActive,
              ]}
              onPress={() => {
                setComparisonMode('different');
                setCurrentEmbedding(null);
                setPreviousEmbedding(null);
                setSimilarity(null);
              }}
            >
              <Text
                style={[
                  styles.toggleButtonText,
                  comparisonMode === 'different' &&
                    styles.toggleButtonTextActive,
                ]}
              >
                Different Images
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.toggleButton,
                comparisonMode === 'same' && styles.toggleButtonActive,
              ]}
              onPress={() => {
                setComparisonMode('same');
                setCurrentEmbedding(null);
                setPreviousEmbedding(null);
                setSimilarity(null);
              }}
            >
              <Text
                style={[
                  styles.toggleButtonText,
                  comparisonMode === 'same' && styles.toggleButtonTextActive,
                ]}
              >
                Same Image
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.inputContainer}>
          <View style={styles.imagesRow}>
            <View style={styles.imagePreviewContainer}>
              <Text style={styles.imagePreviewTitle}>
                {comparisonMode === 'same'
                  ? 'Image (Copy 1):'
                  : 'Previous Image:'}
              </Text>
              <Image
                source={{ uri: leftImage.uri }}
                style={styles.imagePreview}
              />
              <Text style={styles.imageName}>{leftImage.name}</Text>
              <Button
                title="Embed Left"
                onPress={handleEmbedLeftImage}
                disabled={isLoading}
              />
            </View>

            <View style={styles.imagePreviewContainer}>
              <Text style={styles.imagePreviewTitle}>
                {comparisonMode === 'same'
                  ? 'Image (Copy 2):'
                  : 'Current Image:'}
              </Text>
              <Image
                source={{ uri: rightImage.uri }}
                style={styles.imagePreview}
              />
              <Text style={styles.imageName}>{rightImage.name}</Text>
              <Button
                title="Embed Right"
                onPress={handleEmbedRightImage}
                disabled={isLoading}
              />
            </View>
          </View>

          <Button
            title="Compare Embeddings"
            onPress={handleCompareEmbeddings}
            style={styles.buttonCompare}
          />
        </View>

        <ErrorDisplay message={errorMessage} />
        <LoadingDisplay
          isLoading={isLoading}
          loadingText="Embedding image..."
        />
      </Section>

      {similarity !== null && (
        <Result title="Similarity Result">
          <View style={styles.resultCard}>
            <Text style={styles.comparisonText}>
              Comparing: {leftImage.name} vs {rightImage.name}
              {comparisonMode === 'same' && ' (Same Image)'}
            </Text>
            <Text style={styles.similarityText}>
              Cosine Similarity:{' '}
              <Text style={styles.boldText}>{similarity.toFixed(4)}</Text>
            </Text>
          </View>
        </Result>
      )}
    </Screen>
  );
}
