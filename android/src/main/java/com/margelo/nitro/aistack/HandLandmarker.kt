package com.margelo.nitro.aistack

import android.util.Log
import com.facebook.proguard.annotations.DoNotStrip
import com.google.mediapipe.framework.image.BitmapImageBuilder
import com.google.mediapipe.tasks.core.BaseOptions
import com.google.mediapipe.tasks.core.Delegate as MediaPipeDelegate
import com.google.mediapipe.tasks.vision.core.RunningMode as MediaPipeVisionRunningMode
import com.google.mediapipe.tasks.vision.handlandmarker.HandLandmarker
import com.google.mediapipe.tasks.vision.handlandmarker.HandLandmarkerResult as MediaPipeHandLandmarkerResult
import com.margelo.nitro.core.Promise
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext

@DoNotStrip
class HandLandmarker : HybridHandLandmarkerSpec() {

  companion object {
    private const val TAG = "NitroHandLandmarker"
  }

  private val moduleBase =
    MediaPipeModuleBase<HandLandmarker, HandLandmarkerOptions>("NitroHandLandmarker")

  override fun initialize(source: ModelSource, options: HandLandmarkerOptions?): Promise<Unit> {
    return moduleBase.initializeWithCaching(source, options) { modelPath, opts ->
      val requestedDelegate = opts?.delegate ?: Delegate.CPU

      val baseOptionsBuilder = BaseOptions.builder()
        .setModelAssetPath(modelPath)

      when (requestedDelegate) {
        Delegate.CPU -> {
          baseOptionsBuilder.setDelegate(MediaPipeDelegate.CPU)
          Log.d(TAG, "Using CPU delegate for hand landmarks")
        }

        Delegate.GPU -> {
          baseOptionsBuilder.setDelegate(MediaPipeDelegate.GPU)
          Log.d(TAG, "Using GPU delegate for hand landmarks")
        }
      }

      val baseOptions = baseOptionsBuilder.build()

      val runningMode = when (opts?.runningMode) {
        VisionRunningMode.IMAGE -> MediaPipeVisionRunningMode.IMAGE
        VisionRunningMode.DEFAULT -> MediaPipeVisionRunningMode.IMAGE
        null -> MediaPipeVisionRunningMode.IMAGE
      }

      val landmarkerOptions = HandLandmarker.HandLandmarkerOptions.builder()
        .setBaseOptions(baseOptions)
        .setRunningMode(runningMode)
        .apply {
          opts?.numHands?.let { setNumHands(it.toInt()) }
          opts?.minHandDetectionConfidence?.let { setMinHandDetectionConfidence(it.toFloat()) }
          opts?.minHandPresenceConfidence?.let { setMinHandPresenceConfidence(it.toFloat()) }
          opts?.minTrackingConfidence?.let { setMinTrackingConfidence(it.toFloat()) }
        }
        .build()

      HandLandmarker.createFromOptions(moduleBase.reactContext, landmarkerOptions)
    }
  }

  override fun detect(
    asset: AssetSource,
    options: ImagePreprocessingOptions?
  ): Promise<HandLandmarkerResult> {
    return Promise.async {
      val landmarker = moduleBase.requireModule()
      val assetPath = AssetFileResolver.resolve(asset, moduleBase.reactContext)
      val bitmap = MediaPipeUtils.toBitmap(assetPath, options)
      val mpImage = BitmapImageBuilder(bitmap).build()

      val results = withContext(Dispatchers.Default) {
        landmarker.detect(mpImage)
      }
      toHandLandmarkerResult(results)
    }
  }

  private fun toHandLandmarkerResult(result: MediaPipeHandLandmarkerResult): HandLandmarkerResult {
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
    val internalLandmarks = ArrayConversions.normalizedLandmarkTo3D(landmarks)
    val internalWorldLandmarks = ArrayConversions.landmarkTo3D(worldLandmarks)
    val internalHandedness = ArrayConversions.categoryTo2D(handedness)

    return HandLandmarkerResult(
      landmarks = internalLandmarks,
      worldLandmarks = internalWorldLandmarks,
      handedness = internalHandedness
    )
  }

  override fun unload() {
    moduleBase.unload()
  }
}
