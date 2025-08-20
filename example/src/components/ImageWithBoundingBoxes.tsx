import { useEffect, useState } from 'react';
import {
  Image,
  StyleSheet,
  Text,
  View,
  type ImageStyle,
  type LayoutChangeEvent,
  type ViewStyle,
} from 'react-native';

const PALETTE = ['#FF3B30', '#007AFF', '#34C759', '#FF9500', '#AF52DE'];

interface BoundingBox {
  originX: number;
  originY: number;
  width: number;
  height: number;
}

interface Detection {
  boundingBox: BoundingBox;
  categories: Array<{
    displayName?: string;
    categoryName?: string;
    score: number;
  }>;
}

export interface DetectionResult {
  detections: Detection[];
}

interface ImageWithBoundingBoxesProps {
  imageUri: string;
  detectionResult?: DetectionResult | null;
  style?: ImageStyle;
  containerStyle?: ViewStyle;
  showLabels?: boolean;
}

export function ImageWithBoundingBoxes({
  imageUri,
  detectionResult,
  style,
  containerStyle,
  showLabels = true,
}: ImageWithBoundingBoxesProps) {
  const [containerLayout, setContainerLayout] = useState<{
    width: number;
    height: number;
  } | null>(null);

  const [originalSize, setOriginalSize] = useState<{
    width: number;
    height: number;
  } | null>(null);

  useEffect(() => {
    let isMounted = true;
    Image.getSize(
      imageUri,
      (width, height) => {
        if (isMounted) setOriginalSize({ width, height });
      },
      () => {}
    );

    return () => {
      isMounted = false;
    };
  }, [imageUri]);

  const onImageLoad = (e: any) => {
    const src = e?.nativeEvent?.source;
    if (src?.width && src?.height) {
      setOriginalSize({ width: src.width, height: src.height });
    }
  };

  const onContainerLayout = (event: LayoutChangeEvent) => {
    const { width, height } = event.nativeEvent.layout;
    setContainerLayout({ width, height });
  };

  const renderBoundingBoxes = () => {
    if (!detectionResult?.detections?.length || !containerLayout) {
      return null;
    }

    const { width: cw, height: ch } = containerLayout;

    // If we know the original image size, compute exact letterboxing.
    // Otherwise, fall back to assuming the image fills the container.
    const iw = originalSize?.width ?? cw;
    const ih = originalSize?.height ?? ch;
    const scale = Math.min(cw / iw, ch / ih);
    const displayedWidth = iw * scale;
    const displayedHeight = ih * scale;
    const offsetX = originalSize ? (cw - displayedWidth) / 2 : 0;
    const offsetY = originalSize ? (ch - displayedHeight) / 2 : 0;

    return detectionResult.detections.map(
      (detection: Detection, index: number) => {
        const { boundingBox } = detection;

        const isNormalized =
          boundingBox.originX <= 1 &&
          boundingBox.originY <= 1 &&
          boundingBox.width <= 1 &&
          boundingBox.height <= 1;

        const left = isNormalized
          ? offsetX + boundingBox.originX * displayedWidth
          : offsetX + boundingBox.originX * scale;
        const top = isNormalized
          ? offsetY + boundingBox.originY * displayedHeight
          : offsetY + boundingBox.originY * scale;
        const width = Math.max(
          isNormalized
            ? boundingBox.width * displayedWidth
            : boundingBox.width * scale,
          1
        );
        const height = Math.max(
          isNormalized
            ? boundingBox.height * displayedHeight
            : boundingBox.height * scale,
          1
        );

        const color = PALETTE[index % PALETTE.length];

        const category = detection.categories?.[0];
        const categoryName = category?.displayName || category?.categoryName;
        const label = categoryName
          ? `${categoryName} ${(category?.score ? category.score * 100 : 0).toFixed(0)}%`
          : undefined;

        return (
          <View key={index} pointerEvents="none">
            <View
              style={[
                styles.box,
                {
                  left,
                  top,
                  width,
                  height,
                  borderColor: color,
                },
              ]}
            />

            {showLabels && label && (
              <View
                style={[
                  styles.label,
                  {
                    left: Math.max(0, left),
                    top: Math.max(0, top - 22),
                    backgroundColor: color,
                  },
                ]}
              >
                <Text style={styles.labelText}>{label}</Text>
              </View>
            )}
          </View>
        );
      }
    );
  };

  return (
    <View
      style={[styles.container, style, containerStyle]}
      onLayout={onContainerLayout}
    >
      {/* The Image is sized to the container; actual bitmap is letterboxed via contain */}
      <Image
        source={{ uri: imageUri }}
        style={styles.image}
        resizeMode="contain"
        onLoad={onImageLoad}
      />
      <View style={styles.overlay} pointerEvents="none">
        {renderBoundingBoxes()}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  overlay: {
    position: 'absolute',
    left: 0,
    top: 0,
    right: 0,
    bottom: 0,
    zIndex: 2,
    elevation: 3,
  },
  box: {
    position: 'absolute',
    borderWidth: 2,
    zIndex: 2,
    elevation: 3,
  },
  label: {
    position: 'absolute',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    zIndex: 3,
    elevation: 4,
  },
  labelText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
});
