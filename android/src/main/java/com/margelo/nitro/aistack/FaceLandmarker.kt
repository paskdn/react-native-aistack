package com.margelo.nitro.aistack

import com.facebook.proguard.annotations.DoNotStrip
import com.google.mediapipe.framework.image.BitmapImageBuilder
import com.google.mediapipe.tasks.core.BaseOptions
import com.margelo.nitro.core.Promise
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import com.google.mediapipe.tasks.vision.core.RunningMode as MediaPipeVisionRunningMode
import com.google.mediapipe.tasks.vision.facelandmarker.FaceLandmarker as MediaPipeFaceLandmarker
import com.google.mediapipe.tasks.vision.facelandmarker.FaceLandmarkerResult as MediaPipeFaceLandmarkerResult

@DoNotStrip
class FaceLandmarker : HybridFaceLandmarkerSpec() {

  private val moduleBase =
    MediaPipeModuleBase<MediaPipeFaceLandmarker, FaceLandmarkerOptions>("NitroFaceLandmarker")

  override fun initialize(source: ModelSource, options: FaceLandmarkerOptions?): Promise<Unit> {
    return moduleBase.initializeWithCaching(source, options) { modelPath, opts ->
      val baseOptions = BaseOptions.builder()
        .setModelAssetPath(modelPath)
        .build()

      val runningMode = when (opts?.runningMode) {
        VisionRunningMode.IMAGE -> MediaPipeVisionRunningMode.IMAGE
        VisionRunningMode.DEFAULT -> MediaPipeVisionRunningMode.IMAGE
        null -> MediaPipeVisionRunningMode.IMAGE
      }

      val landmarkerOptions = MediaPipeFaceLandmarker.FaceLandmarkerOptions.builder()
        .setBaseOptions(baseOptions)
        .setRunningMode(runningMode)
        .apply {
          opts?.numFaces?.let { setNumFaces(it.toInt()) }
          opts?.minFaceDetectionConfidence?.let { setMinFaceDetectionConfidence(it.toFloat()) }
          opts?.minFacePresenceConfidence?.let { setMinFacePresenceConfidence(it.toFloat()) }
          opts?.minTrackingConfidence?.let { setMinTrackingConfidence(it.toFloat()) }
          opts?.outputFaceBlendshapes?.let { setOutputFaceBlendshapes(it) }
          opts?.outputFacialTransformationMatrixes?.let { setOutputFacialTransformationMatrixes(it) }
        }
        .build()

      MediaPipeFaceLandmarker.createFromOptions(moduleBase.reactContext, landmarkerOptions)
    }
  }

  override fun detect(
    asset: AssetSource,
    options: ImagePreprocessingOptions?
  ): Promise<FaceLandmarkerResult> {
    return Promise.async {
      val landmarker = moduleBase.requireModule()
      val assetPath = AssetFileResolver.resolve(asset, moduleBase.reactContext)
      val bitmap = MediaPipeUtils.toBitmap(assetPath, options)
      val mpImage = BitmapImageBuilder(bitmap).build()

      val results = withContext(Dispatchers.Default) {
        landmarker.detect(mpImage)
      }
      toFaceLandmarkerResult(results)
    }
  }

  private fun toFaceLandmarkerResult(result: MediaPipeFaceLandmarkerResult): FaceLandmarkerResult {
    val faceLandmarks = result.faceLandmarks().map { landmarks ->
      landmarks.map { landmark ->
        NormalizedLandmark(
          x = landmark.x().toDouble(),
          y = landmark.y().toDouble(),
          z = landmark.z().toDouble(),
          visibility = landmark.visibility().orElse(0.0f).toDouble(),
          presence = landmark.presence().orElse(0.0f).toDouble()
        )
      }.toTypedArray()
    }.toTypedArray()

    val faceBlendshapes = if (result.faceBlendshapes().isPresent) {
      result.faceBlendshapes().get().map { categories ->
        Classifications(
          categories = categories.map { category ->
            Category(
              score = category.score().toDouble(),
              index = category.index().toDouble(),
              categoryName = category.categoryName(),
              displayName = category.displayName()
            )
          }.toTypedArray(),
          headIndex = 0.0,
          headName = ""
        )
      }.toTypedArray()
    } else {
      null
    }

    val facialTransformationMatrixes = if (result.facialTransformationMatrixes().isPresent) {
      result.facialTransformationMatrixes().get().map { matrix ->
        Matrix(
          rows = 4.0,
          columns = 4.0,
          data = matrix.map { it.toDouble() }.toDoubleArray()
        )
      }.toTypedArray()
    } else {
      null
    }

    val internalFaceLandmarks = ArrayConversions.normalizedLandmarkTo2D(faceLandmarks)

    return FaceLandmarkerResult(
      faceLandmarks = internalFaceLandmarks,
      faceBlendshapes = faceBlendshapes,
      facialTransformationMatrixes = facialTransformationMatrixes
    )
  }

  override fun unload() {
    moduleBase.unload()
  }
}
