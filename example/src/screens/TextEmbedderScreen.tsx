import { useState, useMemo, useEffect } from 'react';
import {
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { useTextEmbedder } from 'react-native-aistack';
import { useCycle } from '../hooks/useCycle';
import { Button } from '../components/common/Button';
import { ErrorDisplay } from '../components/common/ErrorDisplay';
import { LoadingDisplay } from '../components/common/LoadingDisplay';
import { Result } from '../components/common/Result';
import { Screen } from '../components/common/Screen';
import { Section } from '../components/common/Section';
import { Title, Subtitle } from '../components/common/Titles';
import { commonStyles as styles } from '../components/common/styles';

const EXAMPLES_1 = [
  'What a great and fantastic trip.',
  'I enjoy long walks on the beach.',
  'This is a sample sentence for text embedding.',
  'The quick brown fox jumps over the lazy dog.',
];

const EXAMPLES_2 = [
  "it's a charming and often affecting journey.",
  'My favorite food is pizza.',
  'Here is another example to compare similarity.',
  'Quantum computing could revolutionize science.',
];

export function TextEmbedderScreen() {
  const { current: text1, next: next1 } = useCycle(EXAMPLES_1);
  const { current: text2, next: next2 } = useCycle(EXAMPLES_2);

  const [inputText1, setInputText1] = useState(text1);
  const [inputText2, setInputText2] = useState(text2);
  const [similarity, setSimilarity] = useState<number | null>(null);

  const { compare, embed, isLoading, error } = useTextEmbedder({
    uri: 'https://storage.googleapis.com/mediapipe-models/text_embedder/universal_sentence_encoder/float32/latest/universal_sentence_encoder.tflite',
  });

  const [embedding1, setEmbedding1] = useState<number[] | null>(null);
  const [embedding2, setEmbedding2] = useState<number[] | null>(null);

  const handleCompare = async () => {
    const t1 = inputText1?.trim();
    const t2 = inputText2?.trim();

    if (!t1 || !t2) {
      Alert.alert('Error', 'Please provide two sentences to compare.');
      return;
    }

    try {
      const sim = await compare(t1, t2);
      setSimilarity(sim);
    } catch (e) {
      Alert.alert(
        'Error',
        e instanceof Error ? e.message : 'An unknown error occurred.'
      );
    }
  };

  const handleEmbed1 = async () => {
    const t1 = inputText1?.trim();
    if (!t1) return;
    try {
      const emb = await embed(t1);
      setEmbedding1(emb);
    } catch (e) {
      setEmbedding1(null);
    }
  };

  const handleEmbed2 = async () => {
    const t2 = inputText2?.trim();
    if (!t2) return;
    try {
      const emb = await embed(t2);
      setEmbedding2(emb);
    } catch (e) {
      setEmbedding2(null);
    }
  };

  useEffect(() => {
    setInputText1(text1);
  }, [text1]);

  useEffect(() => {
    setInputText2(text2);
  }, [text2]);

  useEffect(() => {
    setEmbedding1(null);
    if (inputText1?.trim()) handleEmbed1();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inputText1]);

  useEffect(() => {
    setEmbedding2(null);
    if (inputText2?.trim()) handleEmbed2();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inputText2]);

  // Compute embeddings for both texts on initial mount
  useEffect(() => {
    if (isLoading) return;
    if (inputText1?.trim()) handleEmbed1();
    if (inputText2?.trim()) handleEmbed2();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading]);

  const errorMessage = useMemo(() => {
    if (!error) return null;
    return `Error: ${error.message} (Code: ${error.code})`;
  }, [error]);

  return (
    <Screen>
      <Section>
        <Title>Text Embedding Comparison</Title>
        <View style={styles.modelInfoContainer}>
          <Subtitle>Model: Universal Sentence Encoder (URL-based)</Subtitle>
          <View style={styles.delegateInfo}>
            <Text style={styles.delegateText}>DELEGATE: CPU</Text>
          </View>
        </View>
        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            placeholder="First sentence"
            value={inputText1}
            onChangeText={setInputText1}
            placeholderTextColor="#888"
          />
          <TouchableOpacity style={styles.cycleButton} onPress={next1}>
            <Text style={styles.cycleButtonText}>↻</Text>
          </TouchableOpacity>
        </View>
        <ScrollView horizontal style={styles.embeddingBlock}>
          {embedding1 && (
            <Text style={styles.embeddingText}>
              {embedding1.map((v) => v.toFixed(4)).join(', ')}
            </Text>
          )}
        </ScrollView>
        <View style={styles.inputRow2}>
          <TextInput
            style={styles.input}
            placeholder="Second sentence"
            value={inputText2}
            onChangeText={setInputText2}
            placeholderTextColor="#888"
          />
          <TouchableOpacity style={styles.cycleButton} onPress={next2}>
            <Text style={styles.cycleButtonText}>↻</Text>
          </TouchableOpacity>
        </View>
        <ScrollView horizontal style={styles.embeddingBlock}>
          {embedding2 && (
            <Text style={styles.embeddingText}>
              {embedding2.map((v) => v.toFixed(4)).join(', ')}
            </Text>
          )}
        </ScrollView>
        <Button
          title="Compare Similarity"
          onPress={handleCompare}
          disabled={isLoading}
          style={styles.buttonCompare}
        />
      </Section>

      <LoadingDisplay
        isLoading={isLoading}
        loadingText={similarity === null ? 'Loading model...' : 'Embedding...'}
      />

      <ErrorDisplay message={errorMessage} />

      {similarity !== null && (
        <Result title="Comparison Result">
          <View style={styles.resultCard}>
            <View style={styles.similarityMeter}>
              <View
                style={[
                  styles.similarityIndicator,
                  { width: `${Math.max(0, similarity) * 100}%` },
                ]}
              />
            </View>
            <Text style={styles.similarityText}>
              Cosine Similarity:{' '}
              <Text style={styles.boldText}>{similarity.toFixed(4)}</Text>
            </Text>
          </View>
        </Result>
      )}
    </Screen>
  );
}
