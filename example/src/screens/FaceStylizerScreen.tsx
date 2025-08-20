import { useState, useMemo, useEffect } from 'react';
import { Text, View, Alert, Image } from 'react-native';
import { useFaceStylizer, type FaceStylizerResult } from 'react-native-aistack';
import { useCycle } from '../hooks/useCycle';
import { getAssetUri } from '../utils/assetUtils';
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
    name: 'face_input_1.jpg',
    uri: 'https://ai.google.dev/static/mediapipe/images/solutions/face-stylizer-input.png',
  },
  {
    name: 'face_input_2.jpg',
    uri: 'https://storage.googleapis.com/mediapipe-assets/images/face_stylizer_style_color_sketch.jpg',
  },
];

export function FaceStylizerScreen() {
  const { current: currentExample, next: nextExample } =
    useCycle(imageExamples);
  const [result, setResult] = useState<FaceStylizerResult | null>(null);

  const { stylize, isLoading, error } = useFaceStylizer(
    {
      uri: 'https://storage.googleapis.com/mediapipe-models/face_stylizer/blaze_face_stylizer/float32/latest/face_stylizer_color_sketch.task',
    },
    {}
  );

  const handleStylizeImage = async () => {
    try {
      const stylizationResult = await stylize({ uri: currentExample.uri });
      if (stylizationResult) {
        setResult(stylizationResult);
      }
    } catch (e) {
      console.error('Face stylization error:', e);
      Alert.alert(
        'Stylization Error',
        'Failed to stylize image. Please try again.'
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
        <Title>Face Stylization</Title>
        <Subtitle>Model: Face Stylizer Color Sketch (URL-based)</Subtitle>

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
            title="Stylize Image"
            onPress={handleStylizeImage}
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
          loadingText="Stylizing image..."
        />
      </Section>

      {result && (
        <Result title="Stylization Result">
          <View style={styles.resultItem}>
            <Text style={styles.resultText}>
              <Text style={styles.boldText}>Input Image:</Text>{' '}
              {currentExample.name}
            </Text>
            {result.stylizedImagePath && (
              <View>
                <Text style={styles.resultText}>
                  <Text style={styles.boldText}>Stylized Image:</Text>
                </Text>
                <Image
                  source={{
                    uri: getAssetUri({
                      filePath: result.stylizedImagePath,
                    }),
                  }}
                  style={styles.stylizedImagePreview}
                />
              </View>
            )}
          </View>
        </Result>
      )}
    </Screen>
  );
}
