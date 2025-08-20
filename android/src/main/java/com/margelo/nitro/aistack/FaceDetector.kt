package com.margelo.nitro.aistack

import com.facebook.proguard.annotations.DoNotStrip
import com.google.mediapipe.framework.image.BitmapImageBuilder
import com.google.mediapipe.tasks.core.BaseOptions
import com.margelo.nitro.core.Promise
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import com.google.mediapipe.tasks.vision.core.RunningMode as MediaPipeVisionRunningMode
import com.google.mediapipe.tasks.vision.facedetector.FaceDetector as MediaPipeFaceDetector
import com.google.mediapipe.tasks.vision.facedetector.FaceDetectorResult as MediaPipeFaceDetectorResult

@DoNotStrip
class FaceDetector : HybridFaceDetectorSpec() {

  private val moduleBase =
    MediaPipeModuleBase<MediaPipeFaceDetector, FaceDetectorOptions>("NitroFaceDetector")

  override fun initialize(source: ModelSource, options: FaceDetectorOptions?): Promise<Unit> {
    return moduleBase.initializeWithCaching(source, options) { modelPath, opts ->
      val baseOptions = BaseOptions.builder()
        .setModelAssetPath(modelPath)
        .build()

      val runningMode = when (opts?.runningMode) {
        VisionRunningMode.IMAGE -> MediaPipeVisionRunningMode.IMAGE
        VisionRunningMode.DEFAULT -> MediaPipeVisionRunningMode.IMAGE
        null -> MediaPipeVisionRunningMode.IMAGE
      }

      val detectorOptions = MediaPipeFaceDetector.FaceDetectorOptions.builder()
        .setBaseOptions(baseOptions)
        .setRunningMode(runningMode)
        .apply {
          opts?.minDetectionConfidence?.let { minDetectionConfidence ->
            setMinDetectionConfidence(minDetectionConfidence.toFloat())
          }
          opts?.minSuppressionThreshold?.let { minSuppressionThreshold ->
            setMinSuppressionThreshold(minSuppressionThreshold.toFloat())
          }
        }
        .build()

      MediaPipeFaceDetector.createFromOptions(moduleBase.reactContext, detectorOptions)
    }
  }

  override fun detect(
    asset: AssetSource,
    options: ImagePreprocessingOptions?
  ): Promise<FaceDetectionResult> {
    return Promise.async {
      val detector = moduleBase.requireModule()
      val assetPath = AssetFileResolver.resolve(asset, moduleBase.reactContext)
      val bitmap = MediaPipeUtils.toBitmap(assetPath, options)
      val mpImage = BitmapImageBuilder(bitmap).build()

      val results = withContext(Dispatchers.Default) {
        detector.detect(mpImage)
      }
      toFaceDetectionResult(results)
    }
  }

  private fun toFaceDetectionResult(result: MediaPipeFaceDetectorResult): FaceDetectionResult {
    val detections = result.detections().map { detection ->
      val boundingBox = BoundingBox(
        originX = detection.boundingBox().left.toDouble(),
        originY = detection.boundingBox().top.toDouble(),
        width = detection.boundingBox().width().toDouble(),
        height = detection.boundingBox().height().toDouble()
      )

      val categories = detection.categories().map { category ->
        Category(
          score = category.score().toDouble(),
          index = category.index().toDouble(),
          categoryName = category.categoryName(),
          displayName = category.displayName()
        )
      }.toTypedArray()
      Detection(categories, boundingBox)
    }.toTypedArray()

    return FaceDetectionResult(
      detections = detections
    )
  }

  override fun unload() {
    moduleBase.unload()
  }
}
