
# React Native AI Stack

A high-performance React Native library for on-device AI tasks using MediaPipe and React Native Nitro.

> **Note:** This library is in early stages of development and is **not yet published to npm**. See below for development and usage instructions.

> **Current Status:**
> - Static asset support is mostly covered.
> - **Video and stream support is in progress.**
> - The codebase will be split into separate packages for Vision, Text, Audio, and Generative AI tasks in the future.

## ✨ Features

- **🔥 High Performance**: Built with React Native Nitro for optimal performance.
- **🤖 Powered by MediaPipe**: Leverages Google's MediaPipe for a wide range of AI tasks.
- **🧠 Comprehensive Task Support**: Vision, Audio, and Language tasks.
- **📝 Multi-Model Support**: Use various models for different tasks.
- **🎯 TypeScript**: Full TypeScript support.
- **🪝 React Hooks**: Easy-to-use hooks for seamless integration.

## 🚀 Getting Started


### 1. Installation (Coming Soon)

This package is not yet published. Installation via npm/yarn will be available after the first release.

For now, clone the repository and use the example app for development and testing.

### 2. Android Setup

No extra steps are needed. Model files are automatically downloaded via Gradle when you build the project.


### 3. Quick Start (Development Only)

You can try out the library by running the example app from this repository. Here’s how to use the `useTextClassification` hook:

```typescript
import React, { useState } from 'react';
import { Button, Text, TextInput, View } from 'react-native';
import { useTextClassification } from 'react-native-aistack';

function TextClassificationComponent() {
  const [text, setText] = useState('');
  const { classify, result, error } = useTextClassification();

  const handleClassify = async () => {
    if (text) {
      await classify(text);
    }
  };

  return (
    <View>
      <TextInput
        style={{ height: 40, borderColor: 'gray', borderWidth: 1 }}
        onChangeText={setText}
        value={text}
        placeholder="Enter text to classify"
      />
      <Button
        onPress={handleClassify}
        title="Classify Text"
        disabled={!text}
      />
      {error && <Text>Error: {error.message}</Text>}
      {result && (
        <Text>
          Sentiment: {result.classifications[0].categoryName} (Score: {result.classifications[0].score.toFixed(2)})
        </Text>
      )}
    </View>
  );
}
```


## 📱 Example App

The example app demonstrates all currently supported AI tasks, model switching, real-time inference, and performance metrics.

To run the example app:

```bash
# 1. Clone the repository
git clone https://github.com/paskdn/react-native-aistack.git
cd react-native-aistack

# 2. Install dependencies
yarn install

# 3. Run the app
yarn example android
```

### Explore the Example App

The example app is a [Yarn workspace](https://classic.yarnpkg.com/en/docs/workspaces/). You can open the `example` directory in your editor to explore the code and see how to use the different hooks and components. This is a great way to learn how to use the library and get started with your own projects.

---

## 🚧 Roadmap

- [x] Static asset support
- [ ] Video and stream support (in progress)
- [ ] Separate packages for:
  - `@aistack/vision`
  - `@aistack/text`
  - `@aistack/audio`
  - `@aistack/genai`

Stay tuned for updates!

## 🤖 Available Tasks

This library supports a variety of on-device AI tasks through simple React hooks.

### Vision

- `useFaceDetection`
- `useObjectDetection`
- `useImageClassification`
- `usePoseLandmarker`
- `useHandLandmarker`
- `useGestureRecognizer`
- `useImageEmbedder`
- `useImageSegmenter`
- `useInteractiveSegmenter`
- `useFaceStylizer`

### Audio

- `useAudioClassification`

### Text

- `useTextClassification`
- `useLanguageDetection`
- `useTextEmbedder`

### Generative AI

- `useLlmInference`

## 🛠️ For Developers

### Building from Source

```bash
# Install dependencies
yarn install

# Generate native bindings
yarn nitrogen

# Run example app
yarn example android
```

### Troubleshooting

- **Model not found**: Ensure model files are correctly bundled and the `modelPath` is correct.
- **Build errors**: For Android, ensure Gradle dependencies are correctly resolved.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Contributing

Contributions are welcome! Please read our [contributing guidelines](CONTRIBUTING.md) and submit pull requests.
