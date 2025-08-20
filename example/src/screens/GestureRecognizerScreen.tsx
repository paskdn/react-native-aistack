import { useState, useMemo, useEffect } from 'react';
import { Text, View, Alert, Image } from 'react-native';
import {
  useGestureRecognizer,
  type GestureRecognizerResult,
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

type ImageExample = {
  name: string;
  uri: string;
};
const imageExamples: ImageExample[] = [
  {
    name: 'pointup.jpg',
    uri: 'https://assets.codepen.io/9177687/idea-gcbe74dc69_1920.jpg',
  },
  {
    name: 'thumbsup.jpg',
    uri: 'https://assets.codepen.io/9177687/thumbs-up-ga409ddbd6_1.png',
  },
];

export function GestureRecognizerScreen() {
  const { current: currentExample, next: nextExample } =
    useCycle(imageExamples);
  const [result, setResult] = useState<GestureRecognizerResult | null>(null);

  const { recognize, isLoading, error } = useGestureRecognizer(
    {
      uri: 'https://storage.googleapis.com/mediapipe-models/gesture_recognizer/gesture_recognizer/float16/latest/gesture_recognizer.task',
    },
    {
      numHands: 2,
      minHandDetectionConfidence: 0.5,
      minHandPresenceConfidence: 0.5,
      minTrackingConfidence: 0.5,
      runningMode: 'IMAGE',
    }
  );

  const handleRecognizeImage = async () => {
    try {
      const recognitionResult = await recognize({
        uri: currentExample.uri,
      });
      if (recognitionResult) {
        setResult(recognitionResult);
      }
    } catch (e) {
      console.error('Gesture recognition error:', e);
      Alert.alert(
        'Recognition Error',
        'Failed to recognize gestures. Please try again.'
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
        <Title>Gesture Recognition</Title>
        <Subtitle>Model: Gesture Recognizer (URL-based)</Subtitle>

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
            title="Recognize Image"
            onPress={handleRecognizeImage}
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
          loadingText="Recognizing gestures..."
        />
      </Section>

      {result && (
        <Result title="Recognition Result">
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
            {result.gestures.length > 0 && (
              <View>
                <Text style={styles.resultText}>
                  <Text style={styles.boldText}>Gestures:</Text>
                </Text>
                {result.gestures.map((hand, handIndex) => (
                  <Text key={handIndex} style={styles.subResultText}>
                    Hand #{handIndex + 1}:{' '}
                    {hand
                      .map(
                        (g) =>
                          `${g.categoryName} (${(g.score * 100).toFixed(1)}%)`
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
