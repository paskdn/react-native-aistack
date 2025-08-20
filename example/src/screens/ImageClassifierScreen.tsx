import { useState, useMemo, useEffect } from 'react';
import { Text, View, Alert, Image } from 'react-native';
import {
  useImageClassifier,
  type ImageClassifierResult,
} from 'react-native-aistack';
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

export function ImageClassifierScreen() {
  const { current: currentExample, next: nextExample } =
    useCycle(imageExamples);
  const [result, setResult] = useState<ImageClassifierResult | null>(null);

  const { classify, isLoading, error } = useImageClassifier(
    {
      uri: 'https://storage.googleapis.com/mediapipe-models/image_classifier/efficientnet_lite0/float32/latest/efficientnet_lite0.tflite',
    },
    {
      maxResults: 5,
      delegate: 'CPU',
    }
  );
  const errorMessage = useMemo(() => {
    if (!error) return null;

    let message = `Error: ${error.message}`;
    if (error.code) {
      message += ` (Code: ${error.code})`;
    }

    if (
      error.message.toLowerCase().includes('network') ||
      error.message.toLowerCase().includes('download') ||
      error.message.toLowerCase().includes('connectivity')
    ) {
      message +=
        '\n\nTip: Check your internet connection. On real devices, ensure you have a stable network connection.';
    } else if (
      error.message.toLowerCase().includes('model') ||
      error.message.toLowerCase().includes('load')
    ) {
      message +=
        '\n\nTip: Model loading failed. This may be due to device limitations or network issues. Try using a local model file instead.';
    }

    return message;
  }, [error]);

  const handleClassifyImage = async () => {
    try {
      const classificationResult = await classify({ uri: currentExample.uri });
      if (classificationResult) {
        setResult(classificationResult);
      }
    } catch (e) {
      console.error('Image classification error:', e);
      Alert.alert(
        'Classification Error',
        'Failed to classify image. Please try again.'
      );
    }
  };

  useEffect(() => {
    setResult(null);
  }, [currentExample]);

  return (
    <Screen>
      <Section>
        <Title>Image Classification</Title>
        <Subtitle>Model: EfficientNet Lite0 (URL-based)</Subtitle>

        <View style={styles.inputContainer}>
          <View style={styles.imagePreviewContainer}>
            <Text style={styles.imagePreviewTitle}>Current Image:</Text>
            <Image
              source={{ uri: currentExample.uri }}
              style={styles.imagePreview}
            />
            <Text style={styles.imageName}>{currentExample.name}</Text>
          </View>

          <Button
            title="Classify Image"
            onPress={handleClassifyImage}
            disabled={isLoading}
          />

          <Button
            title="Next Example Image"
            onPress={nextExample}
            variant="outline"
          />
        </View>

        <ErrorDisplay message={errorMessage} />
        <LoadingDisplay
          isLoading={isLoading}
          loadingText="Classifying image..."
        />
      </Section>

      {result && (
        <Result title="Classification Result">
          <View style={styles.resultItem}>
            <Text style={styles.resultText}>
              <Text style={styles.boldText}>Input Image:</Text>{' '}
              {currentExample.name}
            </Text>
            {result.classifications.length > 0 && (
              <View>
                <Text style={styles.resultText}>
                  <Text style={styles.boldText}>Top Classifications:</Text>
                </Text>
                {result.classifications.flatMap(
                  (classificationList, listIndex) =>
                    classificationList.map((category, catIndex) => (
                      <Text
                        key={`${listIndex}-${catIndex}`}
                        style={styles.subResultText}
                      >
                        - {category.displayName || category.categoryName}:{' '}
                        {(category.score * 100).toFixed(1)}%
                      </Text>
                    ))
                )}
              </View>
            )}
          </View>
        </Result>
      )}
    </Screen>
  );
}
