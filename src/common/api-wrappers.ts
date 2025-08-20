/**
 * User-facing API wrappers for models with nested array results
 *
 * These wrappers provide the familiar array-based API while internally
 * handling the flat array structures that work around Nitrogen's codegen bug.
 */

import { NitroModules } from 'react-native-nitro-modules';
import type { ImageClassifier as InternalImageClassifier } from '../specs/ImageClassifier.nitro';
import type { GestureRecognizer as InternalGestureRecognizer } from '../specs/GestureRecognizer.nitro';
import type { HandLandmarker as InternalHandLandmarker } from '../specs/HandLandmarker.nitro';
import type { PoseLandmarker as InternalPoseLandmarker } from '../specs/PoseLandmarker.nitro';
import type { FaceLandmarker as InternalFaceLandmarker } from '../specs/FaceLandmarker.nitro';

import type {
  ImageClassifierResult,
  GestureRecognizerResult,
  HandLandmarkerResult,
  PoseLandmarkerResult,
  FaceLandmarkerResult,
} from '../common/result-converters';
import { ResultConverters } from '../common/result-converters';

import type {
  ModelSource,
  AssetSource,
  ImagePreprocessingOptions,
} from '../common/types';

/**
 * User-facing ImageClassifier with array-based results
 */
export class ImageClassifierWrapper {
  private internal: InternalImageClassifier;

  constructor() {
    this.internal =
      NitroModules.createHybridObject<InternalImageClassifier>(
        'ImageClassifier'
      );
  }

  async initialize(source: ModelSource, options?: any): Promise<void> {
    return this.internal.initialize(source, options);
  }

  unload(): void {
    return this.internal.unload();
  }

  async classify(
    asset: AssetSource,
    options?: ImagePreprocessingOptions
  ): Promise<ImageClassifierResult> {
    const internalResult = await this.internal.classify(asset, options);
    return ResultConverters.convertImageClassifierResult(internalResult);
  }
}

/**
 * User-facing GestureRecognizer with array-based results
 */
export class GestureRecognizerWrapper {
  private internal: InternalGestureRecognizer;

  constructor() {
    this.internal =
      NitroModules.createHybridObject<InternalGestureRecognizer>(
        'GestureRecognizer'
      );
  }

  async initialize(source: ModelSource, options?: any): Promise<void> {
    return this.internal.initialize(source, options);
  }

  unload(): void {
    return this.internal.unload();
  }

  async recognize(
    asset: AssetSource,
    options?: ImagePreprocessingOptions
  ): Promise<GestureRecognizerResult> {
    const internalResult = await this.internal.recognize(asset, options);
    return ResultConverters.convertGestureRecognizerResult(internalResult);
  }
}

/**
 * User-facing HandLandmarker with array-based results
 */
export class HandLandmarkerWrapper {
  private internal: InternalHandLandmarker;

  constructor() {
    this.internal =
      NitroModules.createHybridObject<InternalHandLandmarker>('HandLandmarker');
  }

  async initialize(source: ModelSource, options?: any): Promise<void> {
    return this.internal.initialize(source, options);
  }

  unload(): void {
    return this.internal.unload();
  }

  async detect(
    asset: AssetSource,
    options?: ImagePreprocessingOptions
  ): Promise<HandLandmarkerResult> {
    const internalResult = await this.internal.detect(asset, options);
    return ResultConverters.convertHandLandmarkerResult(internalResult);
  }
}

/**
 * User-facing PoseLandmarker with array-based results
 */
export class PoseLandmarkerWrapper {
  private internal: InternalPoseLandmarker;

  constructor() {
    this.internal =
      NitroModules.createHybridObject<InternalPoseLandmarker>('PoseLandmarker');
  }

  async initialize(source: ModelSource, options?: any): Promise<void> {
    return this.internal.initialize(source, options);
  }

  unload(): void {
    return this.internal.unload();
  }

  async detect(
    asset: AssetSource,
    options?: ImagePreprocessingOptions
  ): Promise<PoseLandmarkerResult> {
    const internalResult = await this.internal.detect(asset, options);
    return ResultConverters.convertPoseLandmarkerResult(internalResult);
  }
}

/**
 * User-facing FaceLandmarker with array-based results
 */
export class FaceLandmarkerWrapper {
  private internal: InternalFaceLandmarker;

  constructor() {
    this.internal =
      NitroModules.createHybridObject<InternalFaceLandmarker>('FaceLandmarker');
  }

  async initialize(source: ModelSource, options?: any): Promise<void> {
    return this.internal.initialize(source, options);
  }

  unload(): void {
    return this.internal.unload();
  }

  async detect(
    asset: AssetSource,
    options?: ImagePreprocessingOptions
  ): Promise<FaceLandmarkerResult> {
    const internalResult = await this.internal.detect(asset, options);
    return ResultConverters.convertFaceLandmarkerResult(internalResult);
  }
}
