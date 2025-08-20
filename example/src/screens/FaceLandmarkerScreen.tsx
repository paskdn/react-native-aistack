import { useState, useMemo, useEffect } from 'react';
import { Text, View, Alert, Image } from 'react-native';
import {
  useFaceLandmarker,
  type FaceLandmarkerResult,
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
    name: 'face1.jpg',
    uri: 'https://storage.googleapis.com/mediapipe-assets/portrait.jpg',
  },
];

export function FaceLandmarkerScreen() {
  const { current: currentExample, next: nextExample } =
    useCycle(imageExamples);
  const [result, setResult] = useState<FaceLandmarkerResult | null>(null);

  const { detect, isLoading, error } = useFaceLandmarker(
    {
      uri: 'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/latest/face_landmarker.task',
    },
    {
      numFaces: 1,
      outputFaceBlendshapes: true,
      outputFacialTransformationMatrixes: true,
      runningMode: 'IMAGE',
    }
  );

  const handleDetectImage = async () => {
    try {
      const detectionResult = await detect({ uri: currentExample.uri });
      if (detectionResult) {
        console.log({ result: detectionResult });
        setResult(detectionResult);
      }
    } catch (e) {
      console.error('Face landmark detection error:', e);
      Alert.alert(
        'Detection Error',
        'Failed to detect face landmarks. Please try again.'
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
        <Title>Face Landmark Detection</Title>
        <Subtitle>Model: Face Landmarker (URL-based)</Subtitle>

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
              <Text style={styles.boldText}>Faces Detected:</Text>{' '}
              {result.faceLandmarks.length}
            </Text>
            {result.faceLandmarks.map((face, faceIndex) => (
              <View key={faceIndex} style={styles.faceResultContainer}>
                <Text style={styles.faceResultTitle}>
                  Face #{faceIndex + 1}
                </Text>
                <Text style={styles.faceResultText}>
                  Landmarks: {face.length}
                </Text>
                {result.faceBlendshapes &&
                  result.faceBlendshapes[faceIndex] && (
                    <View>
                      <Text style={styles.faceResultText}>Blendshapes:</Text>
                      {result.faceBlendshapes[faceIndex].categories.map(
                        (blendshape, bsIndex: number) => (
                          <Text key={bsIndex} style={styles.blendshapeText}>
                            -{' '}
                            {blendshape.displayName || blendshape.categoryName}:{' '}
                            {(blendshape.score * 100).toFixed(1)}%
                          </Text>
                        )
                      )}
                    </View>
                  )}
                {result.facialTransformationMatrixes &&
                  result.facialTransformationMatrixes[faceIndex] && (
                    <Text style={styles.faceResultText}>
                      Transformation Matrix:{' '}
                      {result.facialTransformationMatrixes[faceIndex].rows}x
                      {result.facialTransformationMatrixes[faceIndex].columns}{' '}
                      (present)
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
