import { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  Alert,
  Switch,
  TouchableOpacity,
} from 'react-native';
import Markdown from '@ronradtke/react-native-markdown-display';
import {
  useLlmInference,
  type LlmInferenceSession,
  type ModelSource,
} from 'react-native-aistack';
import { Button } from '../components/common/Button';

import { Screen } from '../components/common/Screen';
import { Section } from '../components/common/Section';
import { Title } from '../components/common/Titles';
import { ErrorDisplay } from '../components/common/ErrorDisplay';
import { LoadingDisplay } from '../components/common/LoadingDisplay';
import { Result } from '../components/common/Result';

const MODEL_PATH: ModelSource = {
  filePath:
    '/data/local/tmp/llm/Qwen2.5-1.5B-Instruct_multi-prefill-seq_q8_ekv1280.task',
};

export const markdownStyles = {
  body: {
    color: '#222',
    fontSize: 16,
    lineHeight: 22,
  },
  link: {
    color: '#007AFF',
  },
  code_inline: {
    backgroundColor: '#f5f5f5',
    borderRadius: 4,
    paddingHorizontal: 4,
    fontFamily: 'Menlo',
  },
  code_block: {
    backgroundColor: '#f5f5f5',
    borderRadius: 6,
    padding: 8,
    fontFamily: 'Menlo',
    fontSize: 14,
  },
};

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  return String(error);
}

const TabButton = ({
  title,
  isActive,
  onPress,
}: {
  title: string;
  isActive: boolean;
  onPress: () => void;
}) => (
  <TouchableOpacity
    style={[styles.tabButton, isActive && styles.activeTabButton]}
    onPress={onPress}
  >
    <Text
      style={[styles.tabButtonText, isActive && styles.activeTabButtonText]}
    >
      {title}
    </Text>
  </TouchableOpacity>
);

const ConfigSlider = ({
  label,
  value,
  onValueChange,
  min,
  max,
  step = 0.1,
}: {
  label: string;
  value: number;
  onValueChange: (value: number) => void;
  min: number;
  max: number;
  step?: number;
}) => (
  <View style={styles.configRow}>
    <Text style={styles.configLabel}>
      {label}: {value.toFixed(2)}
    </Text>
    <View style={styles.sliderContainer}>
      <TextInput
        style={styles.sliderInput}
        value={value.toString()}
        onChangeText={(text) => {
          const num = parseFloat(text);
          if (!isNaN(num) && num >= min && num <= max) {
            onValueChange(num);
          }
        }}
        keyboardType="numeric"
      />
      <View style={styles.sliderButtons}>
        <TouchableOpacity
          style={styles.sliderButton}
          onPress={() => onValueChange(Math.max(min, value - step))}
        >
          <Text style={styles.sliderButtonText}>-</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.sliderButton}
          onPress={() => onValueChange(Math.min(max, value + step))}
        >
          <Text style={styles.sliderButtonText}>+</Text>
        </TouchableOpacity>
      </View>
    </View>
  </View>
);

export function LlmInferenceScreen() {
  const [prompt, setPrompt] = useState('Tell me a joke');
  const [result, setResult] = useState('');
  const [tokens, setTokens] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [basicTokenCost, setBasicTokenCost] = useState({
    prompt: 0,
    completion: 0,
  });

  const [session, setSession] = useState<LlmInferenceSession | null>(null);
  const [sessionPrompt, setSessionPrompt] = useState('');
  const [sessionResult, setSessionResult] = useState('');
  const [sessionTokenCost, setSessionTokenCost] = useState({
    prompt: 0,
    completion: 0,
  });
  const [clonedSessionResult, setClonedSessionResult] = useState('');

  const [temperature, setTemperature] = useState(0.8);
  const [topK, setTopK] = useState(40);
  const [topP, setTopP] = useState(1.0);
  const [maxTokens, setMaxTokens] = useState(512);
  const [randomSeed, setRandomSeed] = useState(0);

  const [enableVisionModality, setEnableVisionModality] = useState(false);

  const [activeTab, setActiveTab] = useState<
    'basic' | 'session' | 'config' | 'advanced'
  >('basic');

  const { llmInference, isLoading, error } = useLlmInference(MODEL_PATH, {
    maxTokens,
    maxTopK: topK,
    maxNumImages: enableVisionModality ? 1 : 0,
    preferredBackend: 'cpu',
    visionModelOptions: enableVisionModality ? {} : undefined,
  });

  const createNewSession = useCallback(() => {
    if (!llmInference) return;

    try {
      const newSession = llmInference.createSession({
        temperature,
        topK,
        topP,
        randomSeed,
        graphOptions: {
          enableVisionModality,
          includeTokenCostCalculator: true,
        },
        promptTemplates: {
          userPrefix: 'User: ',
          userSuffix: '\n',
          modelPrefix: 'Assistant: ',
          modelSuffix: '\n',
        },
      });
      setSession(newSession);
      Alert.alert('Success', 'New session created with current configuration');
    } catch (err) {
      Alert.alert('Error', `Failed to create session: ${getErrorMessage(err)}`);
    }
  }, [llmInference, temperature, topK, topP, randomSeed, enableVisionModality]);

  const handleGenerate = useCallback(async () => {
    if (!llmInference || !prompt) return;

    setResult('');
    setIsGenerating(true);
    try {
      const fullResponse = await llmInference.generateResponse(prompt);
      setResult(fullResponse.response);
      setBasicTokenCost({
        prompt: fullResponse.stats.tokenCost.promptTokenCount,
        completion: fullResponse.stats.tokenCost.completionTokenCount,
      });
    } catch (err) {
      setResult(`Error: ${getErrorMessage(err)}`);
    } finally {
      setIsGenerating(false);
    }
  }, [llmInference, prompt]);

  const handleSessionInference = useCallback(async () => {
    if (!session || !sessionPrompt) return;

    setSessionResult('Generating...');
    try {
      session.addQueryChunk(sessionPrompt);

      const fullResponse = await session.generateResponse();
      setSessionResult(fullResponse.response);
      setSessionTokenCost({
        prompt: fullResponse.stats.tokenCost.promptTokenCount,
        completion: fullResponse.stats.tokenCost.completionTokenCount,
      });
    } catch (err) {
      setSessionResult(`Error: ${getErrorMessage(err)}`);
    }
  }, [session, sessionPrompt]);

  const handleCloneSession = useCallback(async () => {
    if (!session) return;

    try {
      const clonedSession = session.cloneSession();
      clonedSession.addQueryChunk('Generate a haiku about technology.');
      const fullResponse = await clonedSession.generateResponse();
      setClonedSessionResult(fullResponse.response);
      clonedSession.close();
      Alert.alert('Success', 'Session cloned and used for haiku generation');
    } catch (err) {
      Alert.alert('Error', `Failed to clone session: ${getErrorMessage(err)}`);
    }
  }, [session]);

  const handleUpdateSessionOptions = useCallback(() => {
    if (!session) return;

    try {
      session.updateSessionOptions({
        topK: topK + 10,
        topP: Math.min(topP + 0.1, 1.0),
        randomSeed: randomSeed + 1,
      });
      Alert.alert('Success', 'Session options updated');
    } catch (err) {
      Alert.alert('Error', `Failed to update options: ${getErrorMessage(err)}`);
    }
  }, [session, topK, topP, randomSeed]);

  const handleGetSessionOptions = useCallback(() => {
    if (!session) return;

    try {
      const options = session.getSessionOptions();
      Alert.alert('Session Options', JSON.stringify(options, null, 2));
    } catch (err) {
      Alert.alert('Error', `Failed to get options: ${getErrorMessage(err)}`);
    }
  }, [session]);

  const handleCountTokens = useCallback(async () => {
    if (!llmInference || !prompt) return;

    try {
      const tokenCount = await llmInference.sizeInTokens(prompt);
      setTokens(tokenCount);
    } catch (err) {
      Alert.alert('Error', `Failed to count tokens: ${getErrorMessage(err)}`);
    }
  }, [llmInference, prompt]);

  useEffect(() => {
    return () => {
      if (session) {
        session.close();
      }
    };
  }, [session]);

  const renderBasicTab = () => (
    <Section>
      <Title>Basic Inference</Title>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Enter your prompt"
          value={prompt}
          onChangeText={setPrompt}
          multiline
        />
        <TouchableOpacity
          style={styles.tokenCounter}
          onPress={handleCountTokens}
          disabled={!llmInference || !prompt}
        >
          <Text style={styles.tokenCountText}>
            📊 {tokens > 0 ? `${tokens} tokens` : 'Count tokens'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Main Actions */}
      <View style={styles.actionsSection}>
        <TouchableOpacity
          style={[
            styles.actionButton,
            styles.primaryActionButton,
            (!llmInference || !prompt || isLoading || isGenerating) &&
              styles.disabledButton,
          ]}
          onPress={handleGenerate}
          disabled={!llmInference || !prompt || isLoading || isGenerating}
        >
          <Text style={styles.actionButtonText}>
            {isGenerating ? '⏳' : '✨'} Generate Response
          </Text>
        </TouchableOpacity>
      </View>

      {/* Result Display */}
      {result && (
        <Result title="Generated Response">
          <View style={styles.resultContainer}>
            <Markdown style={markdownStyles}>{result}</Markdown>
          </View>

          {/* Token Cost Display */}
          {basicTokenCost.prompt > 0 && (
            <View style={styles.statsContainer}>
              <Text style={styles.statsText}>
                Prompt: {basicTokenCost.prompt} tokens
              </Text>
              <Text style={styles.statsText}>
                Completion: {basicTokenCost.completion} tokens
              </Text>
            </View>
          )}
        </Result>
      )}

      {/* Loading Indicator */}
      <LoadingDisplay isLoading={isGenerating} loadingText="Generating..." />
    </Section>
  );

  const renderSessionTab = () => (
    <Section>
      <Title>Session Management</Title>

      <View style={styles.buttonRow}>
        <Button
          title="Create New Session"
          onPress={createNewSession}
          disabled={!llmInference}
        />
      </View>

      {session && (
        <>
          <TextInput
            style={styles.input}
            placeholder="Session prompt (will be added as chunk)"
            value={sessionPrompt}
            onChangeText={setSessionPrompt}
            multiline
            editable={!!session}
          />

          <View style={styles.buttonRow}>
            <Button
              title="Generate with Session"
              onPress={handleSessionInference}
              disabled={!sessionPrompt}
            />
            <Button title="Clone Session" onPress={handleCloneSession} />
          </View>
        </>
      )}

      {session && (
        <View style={styles.buttonRow}>
          <Button
            title="Update Options"
            onPress={handleUpdateSessionOptions}
            disabled={!session}
          />
          <Button
            title="Get Options"
            onPress={handleGetSessionOptions}
            disabled={!session}
          />
        </View>
      )}

      {sessionResult && (
        <Result title="Session Result">
          <Markdown>{sessionResult}</Markdown>
          <Text style={styles.tokenText}>
            Prompt Tokens: {sessionTokenCost.prompt}, Completion Tokens:{' '}
            {sessionTokenCost.completion}
          </Text>
        </Result>
      )}

      {clonedSessionResult && (
        <Result title="Cloned Session Result">
          <Markdown>{clonedSessionResult}</Markdown>
        </Result>
      )}
    </Section>
  );

  const renderConfigTab = () => (
    <Section>
      <Title>Configuration Options</Title>

      <ConfigSlider
        label="Temperature"
        value={temperature}
        onValueChange={setTemperature}
        min={0}
        max={2}
        step={0.1}
      />

      <ConfigSlider
        label="Top K"
        value={topK}
        onValueChange={(value) => setTopK(Math.round(value))}
        min={1}
        max={100}
        step={1}
      />

      <ConfigSlider
        label="Top P"
        value={topP}
        onValueChange={setTopP}
        min={0}
        max={1}
        step={0.1}
      />

      <ConfigSlider
        label="Max Tokens"
        value={maxTokens}
        onValueChange={(value) => setMaxTokens(Math.round(value))}
        min={128}
        max={2048}
        step={64}
      />

      <ConfigSlider
        label="Random Seed"
        value={randomSeed}
        onValueChange={(value) => setRandomSeed(Math.round(value))}
        min={0}
        max={1000}
        step={1}
      />
    </Section>
  );

  const renderAdvancedTab = () => (
    <Section>
      <Title>Advanced Features</Title>

      <View style={styles.configRow}>
        <Text style={styles.configLabel}>Enable Vision Modality</Text>
        <Switch
          value={enableVisionModality}
          onValueChange={setEnableVisionModality}
        />
      </View>

      <Text style={styles.infoText}>
        Vision modality allows you to add images to your prompts for multimodal
        AI inference. When enabled, you can include images with your
        session-based prompts using the addImage() method. Note: Image selection
        UI removed to avoid external dependencies.
      </Text>

      <Text style={styles.infoText}>
        Other advanced features include:
        {'\n'}• LoRA model support (via loraPath in options)
        {'\n'}• Custom prompt templates (userPrefix, modelPrefix, etc.)
        {'\n'}• Graph configuration options
        {'\n'}• Constraint handling for guided generation
        {'\n'}• Token cost calculation
        {'\n'}• Session cloning and option updates
        {'\n'}• Streaming cancellation
        {'\n'}• SentencePiece processor access
      </Text>

      <View style={styles.featuresGrid}>
        <View style={styles.featureCard}>
          <Text style={styles.featureTitle}>Session-based Inference</Text>
          <Text style={styles.featureDescription}>
            Create persistent sessions for multi-turn conversations with state
            management.
          </Text>
        </View>

        <View style={styles.featureCard}>
          <Text style={styles.featureTitle}>Token Management</Text>
          <Text style={styles.featureDescription}>
            Count tokens, manage context length, and optimize performance.
          </Text>
        </View>

        <View style={styles.featureCard}>
          <Text style={styles.featureTitle}>Multimodal Support</Text>
          <Text style={styles.featureDescription}>
            Add images to prompts for vision-enabled models.
          </Text>
        </View>
      </View>
    </Section>
  );

  return (
    <Screen>
      {isLoading ? (
        <LoadingDisplay
          isLoading={isLoading}
          loadingText="Initializing LLM Engine..."
        />
      ) : error ? (
        <ErrorDisplay message={getErrorMessage(error)} />
      ) : (
        <>
          <View style={styles.tabs}>
            <TabButton
              title="Basic"
              isActive={activeTab === 'basic'}
              onPress={() => setActiveTab('basic')}
            />
            <TabButton
              title="Session"
              isActive={activeTab === 'session'}
              onPress={() => setActiveTab('session')}
            />
            <TabButton
              title="Config"
              isActive={activeTab === 'config'}
              onPress={() => setActiveTab('config')}
            />
            <TabButton
              title="Advanced"
              isActive={activeTab === 'advanced'}
              onPress={() => setActiveTab('advanced')}
            />
          </View>

          <ScrollView style={styles.content}>
            {activeTab === 'basic' && renderBasicTab()}
            {activeTab === 'session' && renderSessionTab()}
            {activeTab === 'config' && renderConfigTab()}
            {activeTab === 'advanced' && renderAdvancedTab()}
          </ScrollView>
        </>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    padding: 12,
    backgroundColor: '#fff',
  },
  error: {
    color: 'red',
    padding: 12,
    backgroundColor: '#ffebee',
  },
  tabContainer: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  tabButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginHorizontal: 2,
  },
  activeTabButton: {
    borderBottomWidth: 2,
    borderBottomColor: '#2196F3',
  },
  tabButtonText: {
    fontSize: 14,
    color: '#666',
  },
  activeTabButtonText: {
    color: '#2196F3',
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  tabContent: {
    padding: 12,
    paddingBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
    backgroundColor: '#fff',
    minHeight: 50,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginBottom: 12,
  },
  buttonWrapper: {
    flex: 1,
    marginHorizontal: 4,
  },
  tokenSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  tokenCount: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginLeft: 12,
  },
  tokenText: {
    fontSize: 13,
    color: '#666',
    marginBottom: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 12,
    marginBottom: 6,
    color: '#333',
  },
  resultText: {
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    minHeight: 80,
    marginBottom: 12,
  },
  loadingIndicator: {
    marginTop: 6,
  },
  configRow: {
    marginBottom: 16,
  },
  configLabel: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 6,
    color: '#333',
  },
  sliderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  sliderInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
    padding: 6,
    minWidth: 70,
    textAlign: 'center',
    flex: 1,
    marginRight: 10,
  },
  sliderButtons: {
    flexDirection: 'row',
  },
  sliderButton: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
    minWidth: 30,
    alignItems: 'center',
    marginLeft: 4,
    justifyContent: 'center',
  },
  sliderButtonText: {
    color: '#fff',
    fontSize: 14,
  },
  infoText: {
    fontSize: 13,
    color: '#666',
    lineHeight: 18,
    marginVertical: 6,
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 8,
  },
  featuresGrid: {
    marginTop: 12,
  },
  featureCard: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  featureTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 6,
  },
  featureDescription: {
    fontSize: 13,
    color: '#666',
    lineHeight: 17,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginLeft: 8,
    color: '#888',
    fontSize: 13,
  },
  errorText: {
    color: 'red',
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    justifyContent: 'space-around',
  },
  resultLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 12,
    marginBottom: 6,
    color: '#333',
  },
  separator: {
    height: 1,
    backgroundColor: '#e0e0e0',
    marginVertical: 12,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  modeSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    justifyContent: 'space-between',
  },
  modeLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
    marginRight: 10,
  },
  modeToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  modeText: {
    fontSize: 14,
    color: '#888',
    marginHorizontal: 6,
    fontWeight: '500',
  },
  activeModeText: {
    color: '#007AFF',
    fontWeight: 'bold',
  },
  actionsSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  primaryAction: {
    flex: 2,
    marginRight: 8,
  },
  secondaryAction: {
    flex: 1,
    marginLeft: 8,
  },
  utilityAction: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    marginTop: 4,
    marginBottom: 8,
  },
  resultSection: {
    marginTop: 12,
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#eee',
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
  },
  resultTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  resultContainer: {
    minHeight: 80,
    marginBottom: 6,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 6,
    marginBottom: 4,
  },
  statsText: {
    fontSize: 12,
    color: '#666',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  inputContainer: {
    position: 'relative',
    marginBottom: 12,
  },
  tokenCounter: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  tokenCountText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  actionButton: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    marginHorizontal: 4,
  },
  primaryActionButton: {
    backgroundColor: '#2196F3',
  },
  secondaryActionButton: {
    backgroundColor: '#ff6b6b',
  },
  disabledButton: {
    backgroundColor: '#ccc',
    opacity: 0.6,
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
