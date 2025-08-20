import { useState, useMemo } from 'react';
import { Text, View, Alert, Image } from 'react-native';
import { useAudioClassifier, type Category } from 'react-native-aistack';
import { useCycle } from '../hooks/useCycle';
import { Button } from '../components/common/Button';
import { ErrorDisplay } from '../components/common/ErrorDisplay';
import { LoadingDisplay } from '../components/common/LoadingDisplay';
import { Result } from '../components/common/Result';
import { Screen } from '../components/common/Screen';
import { Section } from '../components/common/Section';
import { Title, Subtitle } from '../components/common/Titles';
import { commonStyles as styles } from '../components/common/styles';

type AudioExample = {
  name: string;
  asset: number;
};
const audioExamples: AudioExample[] = [
  {
    name: 'cat-purring.mp3',
    asset: require('../../assets/audio/cat-purring.mp3'),
  },
  {
    name: 'train.mp3',
    asset: require('../../assets/audio/train.mp3'),
  },
  {
    name: 'car-horn.wav',
    asset: require('../../assets/audio/car-horn.wav'),
  },
  {
    name: 'gunshots.wav',
    asset: require('../../assets/audio/gunshots.wav'),
  },
  {
    name: 'snoring.wav',
    asset: require('../../assets/audio/snoring.wav'),
  },
];

type ResultState = {
  name: string;
  classificationResults: {
    timestampMs?: number;
    categories: Category[];
  }[];
  inferenceTime?: number;
} | null;

export function AudioClassifierScreen() {
  const { current: currentExample, next: nextExample } =
    useCycle(audioExamples);
  const [result, setResult] = useState<ResultState>(null);

  const { classify, isLoading, error } = useAudioClassifier(
    {
      uri: 'https://storage.googleapis.com/mediapipe-models/audio_classifier/yamnet/float32/1/yamnet.tflite',
    },
    {
      maxResults: 5,
    }
  );
  const handleClassifyAudio = async () => {
    try {
      const classificationResult = await classify({
        uri: Image.resolveAssetSource(currentExample.asset).uri,
      });
      if (classificationResult) {
        console.log({ audioClassifierResult: classificationResult });
        const processedResults = classificationResult.classificationResults.map(
          (item) => {
            const allCategories = item.classifications.flatMap(
              (classifications) => classifications.categories
            );

            return {
              categories: allCategories,
            };
          }
        );

        setResult({
          name: currentExample.name,
          classificationResults: processedResults,
          inferenceTime: classificationResult.inferenceTime,
        });
      }
    } catch (e) {
      console.error('Classification error:', e);
      Alert.alert(
        'Classification Error',
        'Failed to classify audio. Please try again.'
      );
    }
  };

  const errorMessage = useMemo(() => {
    if (!error) return null;
    return `Error: ${error.message} (Code: ${error.code})`;
  }, [error]);

  return (
    <Screen>
      <Section>
        <Title>Audio Classification</Title>
        <Subtitle>Model: YamNet (URL-based)</Subtitle>

        <View style={styles.inputContainer}>
          <View style={styles.audioInfoContainer}>
            <Text style={styles.audioInfoTitle}>Current Audio Sample:</Text>
            <Text style={styles.audioInfoText}>{currentExample.name}</Text>
            <Text style={styles.audioInfoDetails}>
              Audio info not available for this example.
            </Text>
          </View>

          <Button
            title="Classify Audio"
            onPress={handleClassifyAudio}
            disabled={isLoading}
          />

          <Button
            title="Next Example"
            onPress={nextExample}
            variant="outline"
          />
        </View>

        <ErrorDisplay message={errorMessage} />
        <LoadingDisplay
          isLoading={isLoading}
          loadingText="Classifying audio..."
        />
      </Section>

      {result && (
        <Result title="Classification Result">
          <View style={styles.resultItem}>
            <Text style={styles.resultText}>
              <Text style={styles.boldText}>Audio:</Text> {result.name}
            </Text>
            {result.inferenceTime && (
              <Text style={styles.timestampText}>
                Inference Time: {result.inferenceTime.toFixed(1)}ms
              </Text>
            )}
            <Text style={styles.timestampText}>
              Classification Results: {result.classificationResults.length}
            </Text>

            <View style={styles.tableContainer}>
              <View style={styles.tableHeader}>
                <Text style={[styles.tableHeaderText, styles.timestampColumn]}>
                  Timestamp (MS)
                </Text>
                <Text style={[styles.tableHeaderText, styles.categoryColumn]}>
                  Category
                </Text>
                <Text style={[styles.tableHeaderText, styles.confidenceColumn]}>
                  Confidence
                </Text>
              </View>
              {result.classificationResults.map((res, resultIndex) => {
                const topCategory = [...res.categories].sort(
                  (a, b) => b.score - a.score
                )[0];

                return (
                  <View key={resultIndex} style={styles.tableRow}>
                    <Text
                      style={[styles.tableCellText, styles.timestampColumn]}
                    >
                      {res.timestampMs ? res.timestampMs.toFixed(0) : 'N/A'}
                    </Text>
                    <Text style={[styles.tableCellText, styles.categoryColumn]}>
                      {topCategory?.displayName ||
                        topCategory?.categoryName ||
                        'Unknown'}
                    </Text>
                    <Text
                      style={[styles.tableCellText, styles.confidenceColumn]}
                    >
                      {topCategory ? topCategory.score.toFixed(3) : 'N/A'}
                    </Text>
                  </View>
                );
              })}
            </View>
          </View>
        </Result>
      )}
    </Screen>
  );
}
