package com.margelo.nitro.aistack

import com.facebook.proguard.annotations.DoNotStrip
import com.google.mediapipe.framework.image.BitmapImageBuilder
import com.google.mediapipe.tasks.components.processors.ClassifierOptions
import com.google.mediapipe.tasks.core.BaseOptions
import com.google.mediapipe.tasks.vision.gesturerecognizer.GestureRecognizer
import com.margelo.nitro.core.Promise
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import com.google.mediapipe.tasks.vision.core.RunningMode as MediaPipeVisionRunningMode
import com.google.mediapipe.tasks.vision.gesturerecognizer.GestureRecognizerResult as MediaPipeGestureRecognizerResult

@DoNotStrip
class GestureRecognizer : HybridGestureRecognizerSpec() {

  private val moduleBase =
    MediaPipeModuleBase<GestureRecognizer, GestureRecognizerOptions>("NitroGestureRecognizer")

  override fun initialize(source: ModelSource, options: GestureRecognizerOptions?): Promise<Unit> {
    return moduleBase.initializeWithCaching(source, options) { modelPath, opts ->
      val baseOptions = BaseOptions.builder()
        .setModelAssetPath(modelPath)
        .build()

      val runningMode = when (opts?.runningMode) {
        VisionRunningMode.IMAGE -> MediaPipeVisionRunningMode.IMAGE
        VisionRunningMode.DEFAULT -> MediaPipeVisionRunningMode.IMAGE
        null -> MediaPipeVisionRunningMode.IMAGE
      }

      val recognizerOptions = GestureRecognizer.GestureRecognizerOptions.builder()
        .setBaseOptions(baseOptions)
        .setRunningMode(runningMode)
        .apply {
          opts?.numHands?.let { setNumHands(it.toInt()) }
          opts?.minHandDetectionConfidence?.let { setMinHandDetectionConfidence(it.toFloat()) }
          opts?.minHandPresenceConfidence?.let { setMinHandPresenceConfidence(it.toFloat()) }
          opts?.minTrackingConfidence?.let { setMinTrackingConfidence(it.toFloat()) }

          opts?.cannedGesturesClassifierOptions?.let { cannedOpts ->
            setCannedGesturesClassifierOptions(
              ClassifierOptions.builder().apply {
                cannedOpts.displayNamesLocale?.let { setDisplayNamesLocale(it) }
                cannedOpts.maxResults?.let { setMaxResults(it.toInt()) }
                cannedOpts.scoreThreshold?.let { setScoreThreshold(it.toFloat()) }
                cannedOpts.categoryAllowlist?.let { setCategoryAllowlist(it.toList()) }
                cannedOpts.categoryDenylist?.let { setCategoryDenylist(it.toList()) }
              }.build()
            )
          }

          opts?.customGesturesClassifierOptions?.let { customOpts ->
            setCustomGesturesClassifierOptions(
              ClassifierOptions.builder().apply {
                customOpts.displayNamesLocale?.let { setDisplayNamesLocale(it) }
                customOpts.maxResults?.let { setMaxResults(it.toInt()) }
                customOpts.scoreThreshold?.let { setScoreThreshold(it.toFloat()) }
                customOpts.categoryAllowlist?.let { setCategoryAllowlist(it.toList()) }
                customOpts.categoryDenylist?.let { setCategoryDenylist(it.toList()) }
              }.build()
            )
          }
        }

        .build()

      GestureRecognizer.createFromOptions(moduleBase.reactContext, recognizerOptions)
    }
  }

  override fun recognize(
    asset: AssetSource,
    options: ImagePreprocessingOptions?
  ): Promise<GestureRecognizerResult> {
    return Promise.async {
      val recognizer = moduleBase.requireModule()
      val assetPath = AssetFileResolver.resolve(asset, moduleBase.reactContext)
      val bitmap = MediaPipeUtils.toBitmap(assetPath, options)
      val mpImage = BitmapImageBuilder(bitmap).build()

      val results = withContext(Dispatchers.Default) {
        recognizer.recognize(mpImage)
      }
      toGestureRecognizerResult(results)
    }
  }

  private fun toGestureRecognizerResult(result: MediaPipeGestureRecognizerResult): GestureRecognizerResult {
    val gestures = result.gestures().map { gestureList ->
      gestureList.map { gesture ->
        Category(
          score = gesture.score().toDouble(),
          index = gesture.index().toDouble(),
          categoryName = gesture.categoryName(),
          displayName = gesture.displayName()
        )
      }.toTypedArray()
    }.toTypedArray()

    val landmarks = arrayOf(result.landmarks().map { handLandmarks ->
      handLandmarks.map { landmark ->
        NormalizedLandmark(
          x = landmark.x().toDouble(),
          y = landmark.y().toDouble(),
          z = landmark.z().toDouble(),
          visibility = landmark.visibility().orElse(0.0f).toDouble(),
          presence = landmark.presence().orElse(0.0f).toDouble()
        )
      }.toTypedArray()
    }.toTypedArray())

    val worldLandmarks = arrayOf(result.worldLandmarks().map { handWorldLandmarks ->
      handWorldLandmarks.map { landmark ->
        Landmark(
          x = landmark.x().toDouble(),
          y = landmark.y().toDouble(),
          z = landmark.z().toDouble(),
          visibility = landmark.visibility().orElse(0.0f).toDouble()

        )
      }.toTypedArray()
    }.toTypedArray())

    val handedness = result.handednesses().map { handednessList ->
      handednessList.map { handedness ->
        Category(
          score = handedness.score().toDouble(),
          index = handedness.index().toDouble(),
          categoryName = handedness.categoryName(),
          displayName = handedness.displayName()
        )
      }.toTypedArray()
    }.toTypedArray()

    // Convert to internal flat structures
    val internalGestures = ArrayConversions.categoryTo2D(gestures)
    val internalLandmarks = ArrayConversions.normalizedLandmarkTo3D(landmarks)
    val internalWorldLandmarks = ArrayConversions.landmarkTo3D(worldLandmarks)
    val internalHandedness = ArrayConversions.categoryTo2D(handedness)

    return GestureRecognizerResult(
      gestures = internalGestures,
      landmarks = internalLandmarks,
      worldLandmarks = internalWorldLandmarks,
      handedness = internalHandedness
    )
  }

  override fun unload() {
    moduleBase.unload()
  }
}
