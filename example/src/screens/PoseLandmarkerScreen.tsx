import { useState, useMemo, useEffect } from 'react';
import { Text, View, Alert, Image } from 'react-native';
import {
  usePoseLandmarker,
  type PoseLandmarkerResult,
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
    name: 'pose1.jpg',
    uri: 'https://assets.codepen.io/9177687/woman-g1af8d3deb_640.jpg',
  },
  {
    name: 'pose2.jpg',
    uri: 'https://assets.codepen.io/9177687/woman-ge0f199f92_640.jpg',
  },
];

export function PoseLandmarkerScreen() {
  const { current: currentExample, next: nextExample } =
    useCycle(imageExamples);
  const [result, setResult] = useState<PoseLandmarkerResult | null>(null);

  const [detect, { isLoading, error }] = usePoseLandmarker(
    {
      uri: 'https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/latest/pose_landmarker_lite.task',
    },
    {
      numPoses: 1,
      outputSegmentationMasks: true,
      runningMode: 'IMAGE',
      delegate: 'CPU',
    }
  );

  const handleDetectImage = async () => {
    try {
      const detectionResult = await detect({ uri: currentExample.uri });
      if (detectionResult) {
        setResult(detectionResult);
      }
    } catch (e) {
      console.error('Pose landmark detection error:', e);
      Alert.alert(
        'Detection Error',
        'Failed to detect pose landmarks. Please try again.'
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
        <Title>Pose Landmark Detection</Title>
        <Subtitle>Model: Pose Landmarker Lite (URL-based)</Subtitle>

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
              <Text style={styles.boldText}>Image:</Text> {currentExample.name}
            </Text>
            <Text style={styles.resultText}>
              <Text style={styles.boldText}>Poses Detected:</Text>{' '}
              {result.landmarks.length}
            </Text>
            {result.landmarks.map((pose: any, poseIndex: number) => (
              <View key={poseIndex} style={styles.poseResultContainer}>
                <Text style={styles.poseResultTitle}>
                  Pose #{poseIndex + 1}
                </Text>
                <Text style={styles.poseResultText}>
                  Landmarks: {pose.length}
                </Text>
                <Text style={styles.poseResultText}>
                  World Landmarks:{' '}
                  {result.worldLandmarks[poseIndex]?.length || 0}
                </Text>
                {result.segmentationMasks &&
                  result.segmentationMasks[poseIndex] && (
                    <Text style={styles.poseResultText}>
                      Segmentation Mask:{' '}
                      {result.segmentationMasks[poseIndex].width}x
                      {result.segmentationMasks[poseIndex].height}
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
