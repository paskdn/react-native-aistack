import { useState, useMemo, useEffect } from 'react';
import { Text, View, Alert } from 'react-native';
import {
  useObjectDetector,
  type ObjectDetectorResult,
} from 'react-native-aistack';
import { useCycle } from '../hooks/useCycle';
import { ImageWithBoundingBoxes } from '../components/ImageWithBoundingBoxes';
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
    name: 'coupledog.jpg',
    uri: 'https://assets.codepen.io/9177687/coupledog.jpeg',
  },
  {
    name: 'doggo.jpg',
    uri: 'https://assets.codepen.io/9177687/doggo.jpeg',
  },
];

export function ObjectDetectorScreen() {
  const { current: currentExample, next: nextExample } =
    useCycle(imageExamples);
  const [result, setResult] = useState<ObjectDetectorResult | null>(null);

  const { detect, isLoading, error } = useObjectDetector(
    {
      uri: 'https://storage.googleapis.com/mediapipe-models/object_detector/efficientdet_lite0/float16/latest/efficientdet_lite0.tflite',
    },
    {
      maxResults: 5,
      runningMode: 'IMAGE',
    }
  );

  const handleDetectImage = async () => {
    try {
      const detectionResult = await detect({ uri: currentExample.uri });
      if (detectionResult) {
        setResult(detectionResult);
      }
    } catch (e) {
      console.error('Object detection error:', e);
      Alert.alert(
        'Detection Error',
        'Failed to detect objects. Please try again.'
      );
    }
  };

  useEffect(() => {
    setResult(null);
  }, [currentExample]);

  const errorMessage = useMemo(() => {
    if (!error) return null;
    return `Error: ${error.message} (Code: ${error.code})`;
  }, [error]);

  return (
    <Screen>
      <Section>
        <Title>Object Detection</Title>
        <Subtitle>Model: EfficientDet Lite0 (URL-based)</Subtitle>

        <View style={styles.inputContainer}>
          <View style={styles.imagePreviewContainer}>
            <Text style={styles.imagePreviewTitle}>Current Image:</Text>
            <ImageWithBoundingBoxes
              imageUri={currentExample.uri}
              style={styles.imagePreview}
              detectionResult={result}
              showLabels={true}
            />
            <Text style={styles.imageName}>{currentExample.name}</Text>
          </View>

          <Button
            title="Detect Image"
            onPress={handleDetectImage}
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
          loadingText="Detecting objects..."
        />
      </Section>

      {result && (
        <Result title="Detection Result">
          <View style={styles.resultItem}>
            <Text style={styles.resultText}>
              <Text style={styles.boldText}>Input Image:</Text>{' '}
              {currentExample.name}
            </Text>

            {result.detections.length > 0 && (
              <View style={styles.detectionSummary}>
                <Text style={styles.resultText}>
                  <Text style={styles.boldText}>
                    Found {result.detections.length} object(s)
                  </Text>
                </Text>
                {result.detections.map((detection: any, detIndex: number) => (
                  <View key={detIndex} style={styles.detectionResultContainer}>
                    <Text style={styles.detectionResultTitle}>
                      Detection #{detIndex + 1}
                    </Text>
                    <Text style={styles.detectionResultText}>
                      Bounding Box: ({detection.boundingBox.originX.toFixed(0)},{' '}
                      {detection.boundingBox.originY.toFixed(0)},{' '}
                      {detection.boundingBox.width.toFixed(0)},{' '}
                      {detection.boundingBox.height.toFixed(0)})
                    </Text>
                    {detection.categories.map(
                      (category: any, catIndex: number) => (
                        <Text key={catIndex} style={styles.subResultText}>
                          - {category.displayName || category.categoryName}:{' '}
                          {(category.score * 100).toFixed(1)}%
                        </Text>
                      )
                    )}
                  </View>
                ))}
              </View>
            )}
          </View>
        </Result>
      )}
    </Screen>
  );
}
