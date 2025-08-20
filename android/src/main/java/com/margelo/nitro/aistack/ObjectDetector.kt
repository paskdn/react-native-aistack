package com.margelo.nitro.aistack

import com.facebook.proguard.annotations.DoNotStrip
import com.google.mediapipe.framework.image.BitmapImageBuilder
import com.google.mediapipe.tasks.core.BaseOptions
import com.google.mediapipe.tasks.vision.objectdetector.ObjectDetector
import com.margelo.nitro.core.Promise
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import com.google.mediapipe.tasks.vision.core.RunningMode as MediaPipeVisionRunningMode

@DoNotStrip
class ObjectDetector : HybridObjectDetectorSpec() {

  private val moduleBase =
    MediaPipeModuleBase<ObjectDetector, ObjectDetectorOptions>("NitroObjectDetector")

  override fun initialize(source: ModelSource, options: ObjectDetectorOptions?): Promise<Unit> {
    return moduleBase.initializeWithCaching(source, options) { modelPath, opts ->

      val baseOptions = BaseOptions.builder()
        .setModelAssetPath(modelPath)
        .build()

      val runningMode = when (opts?.runningMode) {
        VisionRunningMode.IMAGE -> MediaPipeVisionRunningMode.IMAGE
        VisionRunningMode.DEFAULT -> MediaPipeVisionRunningMode.IMAGE
        null -> MediaPipeVisionRunningMode.IMAGE
      }

      val detectorOptions = ObjectDetector.ObjectDetectorOptions.builder()
        .setBaseOptions(baseOptions)
        .setRunningMode(runningMode)
        .apply {
          opts?.maxResults?.let { maxResults ->
            setMaxResults(maxResults.toInt())
          }
          opts?.scoreThreshold?.let { scoreThreshold ->
            setScoreThreshold(scoreThreshold.toFloat())
          }
          opts?.categoryAllowlist?.let { setCategoryAllowlist(it.toList()) }
          opts?.categoryDenylist?.let { setCategoryDenylist(it.toList()) }
          opts?.displayNamesLocale?.let { setDisplayNamesLocale(it) }
        }
        .build()

      ObjectDetector.createFromOptions(moduleBase.reactContext, detectorOptions)
    }
  }

  override fun detect(
    asset: AssetSource,
    options: ImagePreprocessingOptions?
  ): Promise<ObjectDetectorResult> {
    return Promise.async {
      val detector = moduleBase.requireModule()
      val assetPath = AssetFileResolver.resolve(asset, moduleBase.reactContext)
      val bitmap = MediaPipeUtils.toBitmap(assetPath, options)
      val mpImage = BitmapImageBuilder(bitmap).build()

      val results = withContext(Dispatchers.Default) {
        detector.detect(mpImage)
      }

      val detections = results.detections().map { detection ->
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

      ObjectDetectorResult(detections)
    }
  }

  override fun unload() {
    moduleBase.unload()
  }
}
