import { useState, useMemo, useEffect } from 'react';
import {
  Text,
  View,
  TouchableOpacity,
  Alert,
  Image,
  PanResponder,
} from 'react-native';
import {
  useInteractiveSegmenter,
  type InteractiveSegmenterResult,
  type RegionOfInterest,
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
    name: 'coupledog.jpg',
    uri: 'https://assets.codepen.io/9177687/coupledog.jpeg',
  },
  {
    name: 'cows.jpg',
    uri: 'https://assets.codepen.io/9177687/cows-7880154_1280.jpg',
  },
];

export function InteractiveSegmenterScreen() {
  const { current: currentExample, next: nextExample } =
    useCycle(imageExamples);
  const [result, setResult] = useState<InteractiveSegmenterResult | null>(null);
  const [segmentationType, setSegmentationType] = useState<
    'category' | 'confidence'
  >('category');
  const [pointOfInterest, setPointOfInterest] = useState<{
    x: number;
    y: number;
  } | null>(null);
  const [imageLayout, setImageLayout] = useState<{
    width: number;
    height: number;
  } | null>(null);

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => false,
    onPanResponderGrant: (event) => {
      handleImagePress(event);
    },
  });

  const {
    segment: segmentCategory,
    isLoading: isLoadingCategory,
    error: errorCategory,
  } = useInteractiveSegmenter(
    {
      uri: 'https://storage.googleapis.com/mediapipe-models/interactive_segmenter/magic_touch/float32/latest/magic_touch.tflite',
    },
    {
      outputCategoryMask: true,
      outputConfidenceMasks: false,
      delegate: 'CPU',
    }
  );

  const {
    segment: segmentConfidence,
    isLoading: isLoadingConfidence,
    error: errorConfidence,
  } = useInteractiveSegmenter(
    {
      uri: 'https://storage.googleapis.com/mediapipe-models/interactive_segmenter/magic_touch/float32/latest/magic_touch.tflite',
    },
    {
      outputCategoryMask: false,
      outputConfidenceMasks: true,
      delegate: 'CPU',
    }
  );

  const segment =
    segmentationType === 'category' ? segmentCategory : segmentConfidence;
  const isLoading =
    segmentationType === 'category' ? isLoadingCategory : isLoadingConfidence;
  const error =
    segmentationType === 'category' ? errorCategory : errorConfidence;

  const handleImagePress = (event: any) => {
    console.log('Touch event:', event.nativeEvent);
    const { pageX, pageY, locationX, locationY } = event.nativeEvent;

    if (!imageLayout) {
      console.log('No image layout available');
      return;
    }

    let touchX = locationX;
    let touchY = locationY;

    if (touchX === undefined || touchY === undefined) {
      console.log('Using pageX/pageY for coordinate calculation');
      console.log('Page coordinates:', { pageX, pageY });
      return;
    }

    console.log('Touch coordinates:', { touchX, touchY });
    console.log('Image layout:', imageLayout);

    const normalizedX = touchX / imageLayout.width;
    const normalizedY = touchY / imageLayout.height;

    const clampedX = Math.max(0, Math.min(1, normalizedX));
    const clampedY = Math.max(0, Math.min(1, normalizedY));

    console.log('Normalized coordinates:', { clampedX, clampedY });

    setPointOfInterest({ x: clampedX, y: clampedY });

    handleSegmentImage(clampedX, clampedY);
  };

  const handleSegmentImage = async (x?: number, y?: number) => {
    try {
      const poi =
        pointOfInterest ||
        (x !== undefined && y !== undefined ? { x, y } : null);

      if (!poi) {
        Alert.alert(
          'Error',
          'Please tap on the image to select a point of interest.'
        );
        return;
      }

      const regionOfInterest: RegionOfInterest = {
        point: poi,
      };

      const segmentationResult = await segment(
        { uri: currentExample.uri },
        regionOfInterest
      );

      if (segmentationResult) {
        setResult(segmentationResult);
      }
    } catch (e) {
      console.error('Interactive segmentation error:', e);
      Alert.alert(
        'Segmentation Error',
        'Failed to perform interactive segmentation. Please try again.'
      );
    }
  };

  useEffect(() => {
    setResult(null);
    setPointOfInterest(null);
  }, [currentExample]);

  const errorMessage = useMemo(() => {
    if (!error) return null;
    return `Error: ${error.message} (Code: ${error.code})`;
  }, [error]);

  return (
    <Screen>
      <Section>
        <Title>Interactive Segmentation</Title>

        <View style={styles.toggleContainer}>
          <Text style={styles.toggleLabel}>Segmentation Type:</Text>
          <View style={styles.toggleButtons}>
            <TouchableOpacity
              style={[
                styles.toggleButton,
                segmentationType === 'category' && styles.toggleButtonActive,
              ]}
              onPress={() => {
                setSegmentationType('category');
                setResult(null);
              }}
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
              onPress={() => {
                setSegmentationType('confidence');
                setResult(null);
              }}
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

        <Subtitle>
          Model: Magic Touch Interactive Segmenter (URL-based)
        </Subtitle>

        <View style={styles.inputContainer}>
          <View style={styles.imagePreviewContainer}>
            <Text style={styles.imagePreviewTitle}>Current Image:</Text>
            <View style={styles.imageContainer}>
              <Image
                source={{ uri: currentExample.uri }}
                style={styles.imagePreview}
                onLayout={(event) => {
                  const { width, height } = event.nativeEvent.layout;
                  setImageLayout({ width, height });
                }}
              />

              {/* Mask overlay */}
              {result && (
                <View style={styles.maskOverlay}>
                  {result.categoryMasks &&
                    result.categoryMasks.length > 0 &&
                    segmentationType === 'category' && (
                      <Image
                        source={{
                          uri: `data:image/png;base64,${btoa(
                            String.fromCharCode(
                              ...new Uint8Array(
                                result.categoryMasks[0]?.mask as any
                              )
                            )
                          )}`,
                        }}
                        style={styles.maskOverlayImage}
                      />
                    )}
                  {result.confidenceMasks &&
                    result.confidenceMasks.length > 0 &&
                    segmentationType === 'confidence' && (
                      <Image
                        source={{
                          uri: `data:image/png;base64,${btoa(
                            String.fromCharCode(
                              ...new Uint8Array(
                                result.confidenceMasks[0]?.mask as any
                              )
                            )
                          )}`,
                        }}
                        style={styles.maskOverlayImage}
                      />
                    )}
                </View>
              )}

              {/* Transparent touchable overlay */}
              <View
                style={styles.pressableOverlay}
                {...panResponder.panHandlers}
              />

              {/* Point of interest indicator */}
              {pointOfInterest && imageLayout && (
                <View
                  style={[
                    styles.pointIndicator,
                    {
                      left: pointOfInterest.x * imageLayout.width - 8,
                      top: pointOfInterest.y * imageLayout.height - 8,
                    },
                  ]}
                />
              )}
            </View>
            <Text style={styles.imageName}>{currentExample.name}</Text>
            <Text style={styles.instructionText}>
              Tap anywhere on the image to select a point of interest
            </Text>
            {pointOfInterest && (
              <Text style={styles.pointOfInterestText}>
                Point of Interest: ({pointOfInterest.x.toFixed(2)},{' '}
                {pointOfInterest.y.toFixed(2)})
              </Text>
            )}
          </View>

          <Button
            title={
              pointOfInterest ? 'Segment Image' : 'Tap image to select point'
            }
            onPress={() => handleSegmentImage()}
            disabled={isLoading || !pointOfInterest}
          />

          <Button
            title="Next Example Image"
            onPress={() => {
              nextExample();
              setPointOfInterest(null);
              setResult(null);
            }}
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
                        uri: `data:image/png;base64,${btoa(
                          String.fromCharCode(
                            ...new Uint8Array(mask.mask as any)
                          )
                        )}`,
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
                        uri: `data:image/png;base64,${btoa(
                          String.fromCharCode(
                            ...new Uint8Array(mask.mask as any)
                          )
                        )}`,
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
