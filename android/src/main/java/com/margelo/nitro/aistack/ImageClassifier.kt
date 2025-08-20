package com.margelo.nitro.aistack

import com.facebook.proguard.annotations.DoNotStrip
import com.google.mediapipe.framework.image.BitmapImageBuilder
import com.google.mediapipe.tasks.core.BaseOptions
import com.google.mediapipe.tasks.vision.core.RunningMode as MediaPipeVisionRunningMode
import com.google.mediapipe.tasks.vision.imageclassifier.ImageClassifier
import com.margelo.nitro.core.Promise
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext

@DoNotStrip
class ImageClassifier : HybridImageClassifierSpec() {

  private val moduleBase =
    MediaPipeModuleBase<ImageClassifier, ImageClassifierOptions>("NitroImageClassifier")

  override fun initialize(source: ModelSource, options: ImageClassifierOptions?): Promise<Unit> {
    return moduleBase.initializeWithCaching(source, options) { modelPath, opts ->
      val baseOptions = BaseOptions.builder()
        .setModelAssetPath(modelPath)
        .build()

      val runningMode = when (opts?.runningMode) {
        VisionRunningMode.IMAGE -> MediaPipeVisionRunningMode.IMAGE
        VisionRunningMode.DEFAULT -> MediaPipeVisionRunningMode.IMAGE
        null -> MediaPipeVisionRunningMode.IMAGE
      }

      val classifierOptions = ImageClassifier.ImageClassifierOptions.builder()
        .setBaseOptions(baseOptions)
        .setRunningMode(runningMode)
        .apply {
          opts?.displayNamesLocale?.let { setDisplayNamesLocale(it) }
          opts?.maxResults?.let { setMaxResults(it.toInt()) }
          opts?.scoreThreshold?.let { setScoreThreshold(it.toFloat()) }
          opts?.categoryAllowlist?.let { setCategoryAllowlist(it.toList()) }
          opts?.categoryDenylist?.let { setCategoryDenylist(it.toList()) }
        }
        .build()

      ImageClassifier.createFromOptions(moduleBase.reactContext, classifierOptions)
    }
  }

  override fun classify(
    asset: AssetSource,
    options: ImagePreprocessingOptions?
  ): Promise<ImageClassifierResult> {
    return Promise.async {
      val classifier = moduleBase.requireModule()
      val assetPath = AssetFileResolver.resolve(asset, moduleBase.reactContext)
      val bitmap = MediaPipeUtils.toBitmap(assetPath, options)
      val mpImage = BitmapImageBuilder(bitmap).build()

      val results = withContext(Dispatchers.Default) {
        classifier.classify(mpImage)
      }


      val classifications = results.classificationResult().classifications().map { classification ->
        classification.categories().map { category ->
          Category(
            score = category.score().toDouble(),
            index = category.index().toDouble(),
            categoryName = category.categoryName(),
            displayName = category.displayName()
          )
        }.toTypedArray()
      }.toTypedArray()

      val internalClassifications = ArrayConversions.categoryTo2D(classifications)

      ImageClassifierResult(
        classifications = internalClassifications
      )
    }
  }

  override fun unload() {
    moduleBase.unload()
  }
}
