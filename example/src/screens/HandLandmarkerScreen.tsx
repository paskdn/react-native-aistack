import { useState, useMemo, useEffect } from 'react';
import { Text, View, Alert, Image } from 'react-native';
import {
  useHandLandmarker,
  type HandLandmarkerResult,
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
    name: 'hand.jpg',
    uri: 'https://assets.codepen.io/9177687/hand-ge4ca13f5d_1920.jpg',
  },
  {
    name: 'couple.jpg',
    uri: 'https://assets.codepen.io/9177687/couple-gb7cb5db4c_1920.jpg',
  },
];

export function HandLandmarkerScreen() {
  const { current: currentExample, next: nextExample } =
    useCycle(imageExamples);
  const [result, setResult] = useState<HandLandmarkerResult | null>(null);

  const { detect, isLoading, error } = useHandLandmarker(
    {
      uri: 'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/latest/hand_landmarker.task',
    },
    {
      numHands: 2,
      minHandDetectionConfidence: 0.5,
      minHandPresenceConfidence: 0.5,
      minTrackingConfidence: 0.5,
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
      console.error('Hand landmark detection error:', e);
      Alert.alert(
        'Detection Error',
        'Failed to detect hand landmarks. Please try again.'
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
        <Title>Hand Landmark Detection</Title>
        <Subtitle>Model: Hand Landmarker (URL-based)</Subtitle>

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
          loadingText="Detecting landmarks..."
        />
      </Section>

      {result && (
        <Result title="Detection Result">
          <View style={styles.resultItem}>
            <Text style={styles.resultText}>
              <Text style={styles.boldText}>Input Image:</Text>{' '}
              {currentExample.name}
            </Text>
            {result.handedness.length > 0 && (
              <View>
                <Text style={styles.resultText}>
                  <Text style={styles.boldText}>Handedness:</Text>
                </Text>
                {result.handedness.map((hand, handIndex) => (
                  <Text key={handIndex} style={styles.subResultText}>
                    Hand #{handIndex + 1}:{' '}
                    {hand
                      .map(
                        (h) =>
                          `${h.categoryName} (${(h.score * 100).toFixed(1)}%)`
                      )
                      .join(', ')}
                  </Text>
                ))}
              </View>
            )}
            {result.landmarks.length > 0 && (
              <Text style={styles.resultText}>
                <Text style={styles.boldText}>Landmarks:</Text>{' '}
                {result.landmarks.length} hands detected
              </Text>
            )}
            {result.worldLandmarks.length > 0 && (
              <Text style={styles.resultText}>
                <Text style={styles.boldText}>World Landmarks:</Text>{' '}
                {result.worldLandmarks.length} hands detected
              </Text>
            )}
          </View>
        </Result>
      )}
    </Screen>
  );
}
