package com.margelo.nitro.aistack

import android.graphics.Bitmap
import android.util.Log
import com.facebook.proguard.annotations.DoNotStrip
import com.google.mediapipe.framework.image.BitmapImageBuilder
import com.google.mediapipe.tasks.core.BaseOptions
import com.google.mediapipe.tasks.core.Delegate as MediaPipeDelegate
import com.google.mediapipe.tasks.vision.core.RunningMode as MediaPipeVisionRunningMode
import com.google.mediapipe.tasks.vision.poselandmarker.PoseLandmarker
import com.google.mediapipe.tasks.vision.poselandmarker.PoseLandmarkerResult as MediaPipePoseLandmarkerResult
import com.margelo.nitro.core.Promise
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import java.io.File
import java.io.FileOutputStream

@DoNotStrip
class PoseLandmarker : HybridPoseLandmarkerSpec() {

  companion object {
    private const val TAG = "NitroPoseLandmarker"
  }

  private val moduleBase =
    MediaPipeModuleBase<PoseLandmarker, PoseLandmarkerOptions>("NitroPoseLandmarker")

  override fun initialize(source: ModelSource, options: PoseLandmarkerOptions?): Promise<Unit> {
    return moduleBase.initializeWithCaching(source, options) { modelPath, opts ->
      val baseOptionsBuilder = BaseOptions.builder()
        .setModelAssetPath(modelPath)

      val requestedDelegate = opts?.delegate ?: Delegate.CPU

      when (requestedDelegate) {
        Delegate.CPU -> {
          baseOptionsBuilder.setDelegate(MediaPipeDelegate.CPU)
          Log.d(TAG, "Using CPU delegate")
        }

        Delegate.GPU -> {
          baseOptionsBuilder.setDelegate(MediaPipeDelegate.GPU)
          Log.d(TAG, "Using GPU delegate")
        }
      }

      val baseOptions = baseOptionsBuilder.build()

      val runningMode = when (opts?.runningMode) {
        VisionRunningMode.IMAGE -> MediaPipeVisionRunningMode.IMAGE
        VisionRunningMode.DEFAULT -> MediaPipeVisionRunningMode.IMAGE
        null -> MediaPipeVisionRunningMode.IMAGE
      }

      val landmarkerOptions = PoseLandmarker.PoseLandmarkerOptions.builder()
        .setBaseOptions(baseOptions)
        .setRunningMode(runningMode)
        .apply {
          opts?.numPoses?.let { numPoses ->
            setNumPoses(numPoses.toInt())
          }
          opts?.minPoseDetectionConfidence?.let { minPoseDetectionConfidence ->
            setMinPoseDetectionConfidence(minPoseDetectionConfidence.toFloat())
          }
          opts?.minPosePresenceConfidence?.let { minPosePresenceConfidence ->
            setMinPosePresenceConfidence(minPosePresenceConfidence.toFloat())
          }
          opts?.minTrackingConfidence?.let { minTrackingConfidence ->
            setMinTrackingConfidence(minTrackingConfidence.toFloat())
          }
          opts?.outputSegmentationMasks?.let { outputSegmentationMasks ->
            setOutputSegmentationMasks(outputSegmentationMasks)
          }
        }
        .build()

      PoseLandmarker.createFromOptions(moduleBase.reactContext, landmarkerOptions)
    }
  }

  override fun detect(
    asset: AssetSource,
    options: ImagePreprocessingOptions?
  ): Promise<PoseLandmarkerResult> {
    return Promise.async {
      try {
        val landmarker = moduleBase.requireModule()
        val assetPath = AssetFileResolver.resolve(asset, moduleBase.reactContext)
        val bitmap = MediaPipeUtils.toBitmap(assetPath, options)
        val mpImage = BitmapImageBuilder(bitmap).build()

        val results = withContext(Dispatchers.Default) {
          landmarker.detect(mpImage)
        }

        // Check if detection was successful
        if (results == null) {
          throw IllegalStateException("Pose Landmarker failed to detect")
        }

        toPoseLandmarkerResult(results)
      } catch (e: Exception) {
        Log.e(TAG, "Detection failed", e)
        throw e
      }
    }
  }

  private fun toPoseLandmarkerResult(result: MediaPipePoseLandmarkerResult): PoseLandmarkerResult {
    val landmarks = result.landmarks().map { landmarkList ->
      landmarkList.map { landmark ->
        NormalizedLandmark(
          x = landmark.x().toDouble(),
          y = landmark.y().toDouble(),
          z = landmark.z().toDouble(),
          visibility = landmark.visibility().orElse(0.0f).toDouble(),
          presence = landmark.presence().orElse(0.0f).toDouble()
        )
      }.toTypedArray()
    }.toTypedArray()

    val worldLandmarks = result.worldLandmarks().map { landmarkList ->
      landmarkList.map { landmark ->
        Landmark(
          x = landmark.x().toDouble(),
          y = landmark.y().toDouble(),
          z = landmark.z().toDouble(),
          visibility = landmark.visibility().orElse(0.0f).toDouble()
          // Note: Ignoring presence field to match web MediaPipe API
        )
      }.toTypedArray()
    }.toTypedArray()

    val segmentationMasks = if (result.segmentationMasks().isPresent) {
      result.segmentationMasks().get().map { mask ->
        val bitmap = MediaPipeUtils.mpImageToBitmap(mask)
        val file =
          File.createTempFile("segmentation_mask", ".png", moduleBase.reactContext.cacheDir)
        FileOutputStream(file).use { out ->
          bitmap.compress(Bitmap.CompressFormat.PNG, 100, out)
        }

        SegmentationMask(
          width = mask.width.toDouble(),
          height = mask.height.toDouble(),
          mask = file.absolutePath
        )
      }.toTypedArray()
    } else {
      emptyArray()
    }


    val internalLandmarks = ArrayConversions.normalizedLandmarkTo2D(landmarks)
    val internalWorldLandmarks = ArrayConversions.landmarkTo2D(worldLandmarks)

    return PoseLandmarkerResult(
      landmarks = internalLandmarks,
      worldLandmarks = internalWorldLandmarks,
      segmentationMasks = segmentationMasks
    )
  }

  override fun unload() {
    moduleBase.unload()
  }
}
