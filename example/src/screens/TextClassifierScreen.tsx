import { useState, useMemo, useEffect } from 'react';
import { Text, View, TextInput, Alert } from 'react-native';
import { useTextClassifier, type Category } from 'react-native-aistack';
import { useCycle } from '../hooks/useCycle';
import { Button } from '../components/common/Button';
import { ErrorDisplay } from '../components/common/ErrorDisplay';
import { LoadingDisplay } from '../components/common/LoadingDisplay';
import { Result } from '../components/common/Result';
import { Screen } from '../components/common/Screen';
import { Section } from '../components/common/Section';
import { Title, Subtitle } from '../components/common/Titles';
import { commonStyles as styles } from '../components/common/styles';

const sentimentExamples = [
  'This is a fantastic movie!',
  'The service at this restaurant was terrible.',
  'I had a wonderful time on my vacation.',
  "I'm really disappointed with the product quality.",
  'What an amazing and uplifting story!',
  'The flight was delayed and the staff were unhelpful.',
];

export function TextClassifierScreen() {
  const { current: currentExample, next: nextExample } =
    useCycle(sentimentExamples);
  const [inputText, setInputText] = useState(currentExample);
  const [result, setResult] = useState<Category[] | null>(null);

  const { classify, data, isLoading, error } = useTextClassifier(
    {
      uri: 'https://storage.googleapis.com/mediapipe-models/text_classifier/bert_classifier/float32/latest/bert_classifier.tflite',
    },
    { maxResults: 3 }
  );

  const handleClassify = async () => {
    if (!inputText.trim()) {
      Alert.alert('Input Error', 'Please enter some text to classify.');
      return;
    }
    const classificationResult = await classify(inputText);
    if (classificationResult) {
      setResult(classificationResult.classifications);
    }
  };

  useEffect(() => {
    setInputText(currentExample);
  }, [currentExample]);

  const errorMessage = useMemo(() => {
    if (!error) return null;
    return `Error: ${error.message} (Code: ${error.code})`;
  }, [error]);

  const getSentimentColor = (category: Category) => {
    const displayName = category.displayName || category.categoryName;
    if (displayName.toLowerCase().includes('positive')) {
      return category.score > 0.7 ? '#4CAF50' : '#8BC34A';
    }
    if (displayName.toLowerCase().includes('negative')) {
      return category.score > 0.7 ? '#F44336' : '#FF7043';
    }
    return '#9E9E9E';
  };

  return (
    <Screen>
      <Section>
        <Title>Text Classification</Title>
        <Subtitle>Model: BERT Classifier (URL-based)</Subtitle>

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Enter text to classify..."
            value={inputText}
            onChangeText={setInputText}
            placeholderTextColor="#888"
          />
          <Button
            title="Classify"
            onPress={handleClassify}
            disabled={isLoading}
          />
        </View>
        <Button title="Next Example" onPress={nextExample} variant="outline" />
      </Section>

      <LoadingDisplay
        isLoading={isLoading}
        loadingText={data ? 'Classifying...' : 'Loading model...'}
      />

      <ErrorDisplay message={errorMessage} />

      {result && (
        <Result title="Classification Result">
          <View style={styles.resultItem}>
            <Text style={styles.resultText}>
              <Text style={styles.boldText}>Input:</Text> "{inputText}"
            </Text>
            <View style={styles.categoriesContainer}>
              {result.map((category) => (
                <View
                  key={category.index}
                  style={[
                    styles.categoryChip,
                    { backgroundColor: getSentimentColor(category) },
                  ]}
                >
                  <Text style={styles.categoryText}>
                    {category.displayName || category.categoryName} (
                    {(category.score * 100).toFixed(1)}%)
                  </Text>
                </View>
              ))}
            </View>
          </View>
        </Result>
      )}
    </Screen>
  );
}
