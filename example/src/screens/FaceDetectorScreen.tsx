import { useState, useMemo, useEffect } from 'react';
import { Text, View, Alert } from 'react-native';
import {
  useFaceDetector,
  type FaceDetectionResult,
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
    name: 'face_detection_1',
    uri: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/Human_faces.jpg/330px-Human_faces.jpg',
  },
  {
    name: 'face_detection_2',
    uri: 'https://www.snexplores.org/wp-content/uploads/2019/11/860_main_beauty.png',
  },
];

export function FaceDetectorScreen() {
  const { current: currentExample, next: nextExample } =
    useCycle(imageExamples);
  const [result, setResult] = useState<FaceDetectionResult | null>(null);

  const { detect, isLoading, error } = useFaceDetector(
    {
      uri: 'https://storage.googleapis.com/mediapipe-models/face_detector/blaze_face_short_range/float16/1/blaze_face_short_range.tflite',
    },
    {
      minDetectionConfidence: 0.5,
    }
  );

  const handleDetectImage = async () => {
    try {
      const detectionResult = await detect({ uri: currentExample.uri });
      console.log('Face detection result:', detectionResult);
      if (detectionResult) {
        setResult(detectionResult);
      }
    } catch (e) {
      console.error('Face detection error:', e);
      Alert.alert(
        'Detection Error',
        'Failed to detect faces. Please try again.'
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
        <Title>Face Detection</Title>
        <Subtitle>Model: BlazeFace Short Range (URL-based)</Subtitle>

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
          loadingText="Detecting faces..."
        />
      </Section>

      {result && (
        <Result title="Detection Result">
          <View style={styles.resultItem}>
            <Text style={styles.resultText}>
              <Text style={styles.boldText}>Faces Detected:</Text>{' '}
              {result.detections.length}
            </Text>
            {result.detections.map((detection: any, detIndex: number) => (
              <View key={detIndex} style={styles.detectionResultContainer}>
                <Text style={styles.detectionResultTitle}>
                  Detection #{detIndex + 1}
                </Text>
                {detection.boundingBox && (
                  <Text style={styles.detectionResultText}>
                    {`Bounding Box: (${Math.round(
                      detection.boundingBox.originX
                    )}, ${Math.round(
                      detection.boundingBox.originY
                    )}, ${Math.round(
                      detection.boundingBox.width
                    )}, ${Math.round(detection.boundingBox.height)})`}
                  </Text>
                )}
                {Array.isArray(detection.categories) &&
                  detection.categories.length > 0 &&
                  (detection.categories[0].displayName ||
                    detection.categories[0].categoryName) && (
                    <Text style={styles.subResultText}>
                      {`- ${
                        detection.categories[0].displayName ||
                        detection.categories[0].categoryName
                      }${
                        typeof detection.categories[0].score === 'number'
                          ? ` ${(detection.categories[0].score * 100).toFixed(
                              1
                            )}%`
                          : ''
                      }`}
                    </Text>
                  )}
              </View>
            ))}
          </View>
        </Result>
      )}
    </Screen>
  );
}
