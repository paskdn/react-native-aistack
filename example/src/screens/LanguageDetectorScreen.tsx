import { useState, useMemo, useEffect } from 'react';
import { Text, View, TextInput, Alert } from 'react-native';
import {
  useLanguageDetector,
  type LanguagePrediction,
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

const languageExamples = [
  'జై బాలయ్య', // Telugu
  'Bonjour le monde', // French
  'Hello, world', // English
  'Hola, mundo', // Spanish
  'Hallo, Welt', // German
  'Ciao, mondo', // Italian
  'こんにちは、世界', // Japanese
  '你好, 世界', // Chinese
];

export function LanguageDetectorScreen() {
  const { current: currentExample, next: nextExample } =
    useCycle(languageExamples);
  const [inputText, setInputText] = useState(currentExample ?? '');
  const [result, setResult] = useState<LanguagePrediction[] | null>(null);

  const { detect, isLoading, error } = useLanguageDetector({
    uri: 'https://storage.googleapis.com/mediapipe-models/language_detector/language_detector/float32/1/language_detector.tflite',
  });

  const handleDetect = async () => {
    if (!inputText.trim()) {
      Alert.alert('Input Error', 'Please enter some text to detect.');
      return;
    }
    const detectionResult = await detect(inputText);
    if (detectionResult) {
      setResult(detectionResult.languages);
    }
  };

  useEffect(() => {
    setInputText(currentExample ?? '');
  }, [currentExample]);

  const errorMessage = useMemo(() => {
    if (!error) return null;
    return `Error: ${error.message} (Code: ${error.code})`;
  }, [error]);

  const languageColors: Record<string, string> = {
    en: '#3498db', // English
    fr: '#e74c3c', // French
    es: '#f1c40f', // Spanish
    de: '#2ecc71', // German
    it: '#9b59b6', // Italian
    unknown: '#95a5a6',
  };

  const getLanguageColor = (langCode: string) => {
    return languageColors[langCode] || languageColors.unknown;
  };

  return (
    <Screen>
      <Section>
        <Title>Language Detection</Title>
        <Subtitle>Model: Language Detector (URL-based)</Subtitle>

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Enter text to detect language..."
            value={inputText}
            onChangeText={setInputText}
            placeholderTextColor="#888"
          />
          <Button title="Detect" onPress={handleDetect} disabled={isLoading} />
        </View>
        <Button title="Next Example" onPress={nextExample} variant="outline" />
      </Section>

      <LoadingDisplay
        isLoading={isLoading}
        loadingText={result ? 'Detecting...' : 'Loading model...'}
      />

      <ErrorDisplay message={errorMessage} />

      {result && (
        <Result title="Detection Result">
          <View style={styles.resultItem}>
            <Text style={styles.resultText}>
              <Text style={styles.boldText}>Input:</Text> "{inputText}"
            </Text>
            <View style={styles.languagesContainer}>
              {result.map((lang) => (
                <View
                  key={lang.languageCode}
                  style={[
                    styles.languageChip,
                    { backgroundColor: getLanguageColor(lang.languageCode) },
                  ]}
                >
                  <Text style={styles.languageText}>
                    {lang.languageCode.toUpperCase()} (
                    {(lang.confidence * 100).toFixed(1)}%)
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
