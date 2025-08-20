package com.margelo.nitro.aistack

import android.graphics.Bitmap
import com.facebook.proguard.annotations.DoNotStrip
import com.google.mediapipe.framework.image.BitmapImageBuilder
import com.google.mediapipe.framework.image.ByteBufferExtractor
import com.google.mediapipe.tasks.core.BaseOptions
import com.google.mediapipe.tasks.vision.core.RunningMode as MediaPipeVisionRunningMode
import com.google.mediapipe.tasks.vision.facestylizer.FaceStylizer
import com.margelo.nitro.core.Promise
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import java.io.File
import java.io.FileOutputStream
import androidx.core.graphics.createBitmap

@DoNotStrip
class FaceStylizer : HybridFaceStylizerSpec() {

  companion object {
    private const val TAG = "NitroFaceStylizer"
  }

  private val moduleBase =
    MediaPipeModuleBase<FaceStylizer, FaceStylizerOptions>("NitroFaceStylizer")

  override fun initialize(source: ModelSource, options: FaceStylizerOptions?): Promise<Unit> {
    return moduleBase.initializeWithCaching(source, options) { modelPath, opts ->
      // NOTE: Face stylizer models may not support delegate configuration
      // Based on the official MediaPipe sample, we only set the model path
      android.util.Log.d(TAG, "Initializing face stylizer with default configuration (no delegate)")
      val baseOptionsBuilder = BaseOptions.builder()
        .setModelAssetPath(modelPath)

      val baseOptions = baseOptionsBuilder.build()

      val runningMode = when (opts?.runningMode) {
        VisionRunningMode.IMAGE -> MediaPipeVisionRunningMode.IMAGE
        VisionRunningMode.DEFAULT -> MediaPipeVisionRunningMode.IMAGE
        null -> MediaPipeVisionRunningMode.IMAGE
      }

      val stylizerOptions = FaceStylizer.FaceStylizerOptions.builder()
        .setBaseOptions(baseOptions)
        .setRunningMode(runningMode)
        .build()

      FaceStylizer.createFromOptions(moduleBase.reactContext, stylizerOptions)
    }
  }

  override fun stylize(
    asset: AssetSource,
    options: ImagePreprocessingOptions?
  ): Promise<FaceStylizerResult> {
    return Promise.async {
      val stylizer = moduleBase.requireModule()
      val assetPath = AssetFileResolver.resolve(asset, moduleBase.reactContext)
      val bitmap = MediaPipeUtils.toBitmap(assetPath, options)
      val mpImage = BitmapImageBuilder(bitmap).build()

      val results = withContext(Dispatchers.Default) {
        stylizer.stylize(mpImage)
      }

      // Check if stylized image is present
      if (!results.stylizedImage().isPresent) {
        throw Exception("Face stylization failed - no stylized image returned")
      }

      val stylizedMPImage = results.stylizedImage().get()


      val byteBuffer = ByteBufferExtractor.extract(stylizedMPImage)
      val width = stylizedMPImage.width
      val height = stylizedMPImage.height

      val stylizedBitmap = createBitmap(width, height)
      stylizedBitmap.copyPixelsFromBuffer(byteBuffer)

      val file = File.createTempFile("stylized_image", ".png", moduleBase.reactContext.cacheDir)
      FileOutputStream(file).use { out ->
        stylizedBitmap.compress(Bitmap.CompressFormat.PNG, 100, out)
      }

      FaceStylizerResult(
        stylizedImagePath = file.absolutePath
      )
    }
  }

  override fun unload() {
    moduleBase.unload()
  }
}
