import { useState, useMemo, useEffect } from 'react';
import { Text, View, TouchableOpacity, Alert, Image } from 'react-native';
import {
  useImageSegmenter,
  type ImageSegmenterResult,
} from 'react-native-aistack';
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
    name: 'dog.jpg',
    uri: 'https://assets.codepen.io/9177687/dog_flickr_publicdomain.jpeg',
  },
  {
    name: 'cat.jpg',
    uri: 'https://assets.codepen.io/9177687/cat_flickr_publicdomain.jpeg',
  },
];

export function ImageSegmenterScreen() {
  const { current: currentExample, next: nextExample } =
    useCycle(imageExamples);
  const [result, setResult] = useState<ImageSegmenterResult | null>(null);
  const [segmentationType, setSegmentationType] = useState<
    'category' | 'confidence'
  >('category');

  const {
    segment: segmentCategory,
    isLoading: isLoadingCategory,
    error: errorCategory,
  } = useImageSegmenter(
    {
      uri: 'https://storage.googleapis.com/mediapipe-models/image_segmenter/selfie_segmenter/float16/latest/selfie_segmenter.tflite',
    },
    {
      outputCategoryMask: true,
      outputConfidenceMasks: false,
      runningMode: 'IMAGE',
      delegate: 'CPU',
    }
  );

  const {
    segment: segmentConfidence,
    isLoading: isLoadingConfidence,
    error: errorConfidence,
  } = useImageSegmenter(
    {
      uri: 'https://storage.googleapis.com/mediapipe-models/image_segmenter/selfie_segmenter/float16/latest/selfie_segmenter.tflite',
    },
    {
      outputCategoryMask: false,
      outputConfidenceMasks: true,
      runningMode: 'IMAGE',
      delegate: 'CPU',
    }
  );

  const segment =
    segmentationType === 'category' ? segmentCategory : segmentConfidence;
  const isLoading =
    segmentationType === 'category' ? isLoadingCategory : isLoadingConfidence;
  const error =
    segmentationType === 'category' ? errorCategory : errorConfidence;

  const handleSegmentImage = async () => {
    try {
      const segmentationResult = await segment({ uri: currentExample.uri });
      if (segmentationResult) {
        setResult(segmentationResult);
      }
    } catch (e) {
      console.error('Image segmentation error:', e);
      Alert.alert(
        'Segmentation Error',
        'Failed to segment image. Please try again.'
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
        <Title>Image Segmentation</Title>

        <View style={styles.toggleContainer}>
          <Text style={styles.toggleLabel}>Segmentation Type:</Text>
          <View style={styles.toggleButtons}>
            <TouchableOpacity
              style={[
                styles.toggleButton,
                segmentationType === 'category' && styles.toggleButtonActive,
              ]}
              onPress={() => setSegmentationType('category')}
            >
              <Text
                style={[
                  styles.toggleButtonText,
                  segmentationType === 'category' &&
                    styles.toggleButtonTextActive,
                ]}
              >
                Category Mask
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.toggleButton,
                segmentationType === 'confidence' && styles.toggleButtonActive,
              ]}
              onPress={() => setSegmentationType('confidence')}
            >
              <Text
                style={[
                  styles.toggleButtonText,
                  segmentationType === 'confidence' &&
                    styles.toggleButtonTextActive,
                ]}
              >
                Confidence Mask
              </Text>
            </TouchableOpacity>
          </View>
        </View>
        <Subtitle>Model: Selfie Segmenter (URL-based)</Subtitle>

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
            title="Segment Image"
            onPress={handleSegmentImage}
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
          loadingText="Segmenting image..."
        />
      </Section>

      {result && (
        <Result title="Segmentation Result">
          <View style={styles.resultItem}>
            <Text style={styles.resultText}>
              <Text style={styles.boldText}>Input Image:</Text>{' '}
              {currentExample.name}
            </Text>
            {result.categoryMasks && result.categoryMasks.length > 0 && (
              <View>
                <Text style={styles.resultText}>
                  <Text style={styles.boldText}>Category Masks:</Text>
                </Text>
                {result.categoryMasks.map((mask, maskIndex) => (
                  <View key={maskIndex} style={styles.maskContainer}>
                    <Text style={styles.maskText}>
                      Mask {maskIndex + 1}: {mask.width}x{mask.height}
                    </Text>
                    <Image
                      source={{
                        uri: getAssetUri({
                          filePath: mask.mask,
                        }),
                      }}
                      style={styles.maskPreview}
                    />
                  </View>
                ))}
              </View>
            )}
            {result.confidenceMasks && result.confidenceMasks.length > 0 && (
              <View>
                <Text style={styles.resultText}>
                  <Text style={styles.boldText}>Confidence Masks:</Text>
                </Text>
                {result.confidenceMasks.map((mask, maskIndex) => (
                  <View key={maskIndex} style={styles.maskContainer}>
                    <Text style={styles.maskText}>
                      Mask {maskIndex + 1}: {mask.width}x{mask.height}
                    </Text>
                    <Image
                      source={{
                        uri: getAssetUri({
                          filePath: mask.mask,
                        }),
                      }}
                      style={styles.maskPreview}
                    />
                  </View>
                ))}
              </View>
            )}
          </View>
        </Result>
      )}
    </Screen>
  );
}
