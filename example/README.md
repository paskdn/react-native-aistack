# React Native AI Stack Example

This example app showcases all the features of the React Native AI Stack library, particularly focusing on **LLM Inference** capabilities.

## Features Demonstrated

### 1. Basic LLM Inference
- **One-shot inference**: Generate responses with a single API call
- **Streaming inference**: Get real-time token-by-token responses
- **Token counting**: Calculate the number of tokens in your prompts
- **Response cancellation**: Stop streaming responses mid-generation

### 2. Session Management
- **Session creation**: Create persistent conversational sessions
- **Session-based inference**: Build up conversations with context
- **Session cloning**: Duplicate sessions for branching conversations
- **Session option updates**: Modify parameters during runtime
- **Session inspection**: View current session configuration

### 3. Configuration Options
The app provides interactive controls for all LLM parameters:
- **Temperature** (0.0 - 2.0): Controls randomness in responses
- **Top K** (1 - 100): Number of top tokens to consider
- **Top P** (0.0 - 1.0): Nucleus sampling threshold
- **Max Tokens** (128 - 2048): Maximum response length
- **Random Seed** (0 - 1000): Seed for reproducible results

### 4. Advanced Features
- **Vision modality**: Support for multimodal image inputs
- **LoRA adaptation**: Fine-tuned model loading
- **Custom prompt templates**: Format conversations with prefixes/suffixes
- **Graph options**: Advanced MediaPipe configuration
- **Constraint handling**: Guided generation support

## How to Use

### Prerequisites
1. **Model File**: Place your LLM model file in the app's bundle
   - Update `MODEL_PATH` in `LlmInferenceScreen.tsx`
   - Supported format: MediaPipe LLM task files (`.task`)

2. **Platform Support**: Currently Android only
   - iOS implementation coming soon

### App Structure

The example app has 4 main tabs:

#### 1. Basic Tab
- Enter prompts and get responses
- Choose between regular or streaming generation
- Count tokens in your prompts
- See real-time streaming with cancellation

#### 2. Session Tab
- Create sessions with custom configuration
- Build conversations by adding prompt chunks
- Clone sessions for parallel conversations
- Update session parameters dynamically

#### 3. Config Tab
- Adjust all LLM parameters with interactive controls
- See immediate effects on response quality
- Experiment with different sampling strategies

#### 4. Advanced Tab
- Enable vision modality for multimodal models
- Learn about advanced features like LoRA and constraints
- Understand session lifecycle and resource management

### API Usage Examples

#### Basic One-shot Inference
```typescript
const response = await llmInference.generateResponse("Tell me a joke");
```

#### Streaming Inference
```typescript
await llmInference.generateResponseAsync(prompt, (partialResult, done) => {
  console.log(partialResult);
  if (done) console.log("Generation complete");
});
```

#### Session-based Conversation
```typescript
const session = llmInference.createSession({
  temperature: 0.7,
  topK: 40,
  topP: 0.9
});

session.addQueryChunk("Hello! What's your name?");
const response1 = await session.generateResponse();

session.addQueryChunk("Can you help me with React Native?");
const response2 = await session.generateResponse();

session.close(); // Clean up resources
```

#### Multimodal Inference
```typescript
const session = llmInference.createSession({
  graphOptions: { enableVisionModality: true }
});

session.addQueryChunk("What do you see in this image?");
session.addImage({ path: "file:///path/to/image.jpg" });
const response = await session.generateResponse();
```

## Configuration Options

### LlmInferenceOptions
```typescript
{
  maxTokens: 512,           // Maximum tokens for input + output
  maxTopK: 40,              // Maximum top-K value
  maxNumImages: 1,          // Maximum images in multimodal prompts
  preferredBackend: 'cpu',  // 'cpu' or 'gpu'
  visionModelOptions: {     // For multimodal models
    encoderPath: '...',
    adapterPath: '...'
  }
}
```

### LlmSessionOptions
```typescript
{
  temperature: 0.8,         // Sampling temperature
  topK: 40,                 // Top-K sampling
  topP: 1.0,                // Top-P (nucleus) sampling
  randomSeed: 0,            // Random seed for reproducibility
  loraPath: '...',          // Path to LoRA adapter
  graphOptions: {           // MediaPipe graph options
    enableVisionModality: true,
    includeTokenCostCalculator: true
  },
  promptTemplates: {        // Custom conversation formatting
    userPrefix: "User: ",
    userSuffix: "\n",
    modelPrefix: "Assistant: ",
    modelSuffix: "\n"
  }
}
```

## Performance Tips

1. **Resource Management**: Always call `session.close()` when done
2. **Batch Processing**: Use sessions for multi-turn conversations
3. **Token Optimization**: Monitor token usage with `sizeInTokens()`
4. **Streaming**: Use streaming for long responses to improve UX
5. **Configuration**: Adjust parameters based on your use case:
   - Lower temperature for factual responses
   - Higher temperature for creative content
   - Adjust top-K/top-P for response diversity

## Troubleshooting

### Common Issues

1. **Model Loading Errors**
   - Ensure model file is in the correct bundle location
   - Check model format compatibility
   - Verify file permissions

2. **Out of Memory**
   - Reduce `maxTokens` setting
   - Use smaller models for testing
   - Close unused sessions

3. **Slow Performance**
   - Try GPU backend if available
   - Optimize prompt length
   - Use appropriate model size

### Debug Tips

- Check console logs for detailed error messages
- Use the "Get Options" button to inspect session state
- Monitor token counts to understand context usage
- Test with simple prompts first

## Next Steps

- Explore different model architectures
- Implement custom prompt templates
- Add image processing for multimodal use cases
- Integrate with your app's specific workflow
- Contribute improvements to the library

## Support

For issues and questions:
- Check the main library documentation
- Open issues on the GitHub repository
- Join the community discussions
