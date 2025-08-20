package com.margelo.nitro.aistack

import android.graphics.Bitmap
import android.util.Log
import com.facebook.proguard.annotations.DoNotStrip
import com.google.mediapipe.framework.image.BitmapImageBuilder
import com.google.mediapipe.tasks.core.BaseOptions
import com.google.mediapipe.tasks.core.Delegate as MediaPipeDelegate
import com.google.mediapipe.tasks.vision.core.RunningMode as MediaPipeVisionRunningMode
import com.google.mediapipe.tasks.vision.imagesegmenter.ImageSegmenter
import com.google.mediapipe.tasks.vision.imagesegmenter.ImageSegmenterResult as MediaPipeImageSegmenterResult
import com.margelo.nitro.core.Promise
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import java.io.File
import java.io.FileOutputStream

@DoNotStrip
class ImageSegmenter : HybridImageSegmenterSpec() {

  companion object {
    private const val TAG = "NitroImageSegmenter"
  }

  private val moduleBase =
    MediaPipeModuleBase<ImageSegmenter, ImageSegmenterOptions>("NitroImageSegmenter")

  override fun initialize(source: ModelSource, options: ImageSegmenterOptions?): Promise<Unit> {
    return moduleBase.initializeWithCaching(source, options) { modelPath, opts ->
      val requestedDelegate = opts?.delegate ?: Delegate.CPU

      Log.d(TAG, "ImageSegmenter initialization - Delegate: $requestedDelegate")

      val baseOptionsBuilder = BaseOptions.builder()
        .setModelAssetPath(modelPath)

      // Configure delegate
      when (requestedDelegate) {
        Delegate.CPU -> {
          baseOptionsBuilder.setDelegate(MediaPipeDelegate.CPU)
          Log.d(TAG, "Using CPU delegate for image segmentation")
        }

        Delegate.GPU -> {
          baseOptionsBuilder.setDelegate(MediaPipeDelegate.GPU)
          Log.d(TAG, "Using GPU delegate for image segmentation")
        }
      }

      val baseOptions = baseOptionsBuilder.build()

      val runningMode = when (opts?.runningMode) {
        VisionRunningMode.IMAGE -> MediaPipeVisionRunningMode.IMAGE
        VisionRunningMode.DEFAULT -> MediaPipeVisionRunningMode.IMAGE
        null -> MediaPipeVisionRunningMode.IMAGE
      }

      // Configure segmentation masks - MediaPipe requires exactly one mask type to be enabled
      val shouldEnableCategoryMask = opts?.outputCategoryMask == true
      val shouldEnableConfidenceMasks = opts?.outputConfidenceMasks == true

      // If neither is explicitly requested, default to category mask (simpler and more stable)
      val finalCategoryMask = if (!shouldEnableCategoryMask && !shouldEnableConfidenceMasks) {
        Log.d(TAG, "No mask type specified, defaulting to category mask")
        true
      } else if (shouldEnableCategoryMask && shouldEnableConfidenceMasks) {
        // If both are requested, prefer category mask for stability
        Log.w(TAG, "Both mask types requested, using category mask for stability")
        true
      } else {
        shouldEnableCategoryMask
      }

      val finalConfidenceMasks = if (finalCategoryMask) false else shouldEnableConfidenceMasks

      Log.d(
        TAG,
        "Mask configuration - Category: $finalCategoryMask, Confidence: $finalConfidenceMasks"
      )

      try {
        val segmenterOptions = ImageSegmenter.ImageSegmenterOptions.builder()
          .setBaseOptions(baseOptions)
          .setRunningMode(runningMode)
          .apply {
            setOutputCategoryMask(finalCategoryMask)
            setOutputConfidenceMasks(finalConfidenceMasks)
            opts?.displayNamesLocale?.let { setDisplayNamesLocale(it) }
          }
          .build()

        ImageSegmenter.createFromOptions(moduleBase.reactContext, segmenterOptions)
      } catch (e: IllegalStateException) {
        Log.e(TAG, "Image segmenter failed to initialize: ${e.message}")
        throw IllegalStateException(
          "Image segmentation initialization failed. See logs for details.",
          e
        )

        throw RuntimeException(
          "Image segmentation failed to initialize. This may be due to GPU incompatibility or emulator limitations. " +
            "Try using CPU delegate or test on a physical device.", e
        )
      }
    }
  }

  override fun segment(
    asset: AssetSource,
    options: ImagePreprocessingOptions?
  ): Promise<ImageSegmenterResult> {
    return Promise.async {
      val segmenter = moduleBase.requireModule()
      val assetPath = AssetFileResolver.resolve(asset, moduleBase.reactContext)
      val bitmap = MediaPipeUtils.toBitmap(assetPath, options)
      val mpImage = BitmapImageBuilder(bitmap).build()

      val results = withContext(Dispatchers.Default) {
        segmenter.segment(mpImage)
      }
      toImageSegmenterResult(results)
    }
  }

  private fun toImageSegmenterResult(result: MediaPipeImageSegmenterResult): ImageSegmenterResult {
    val confidenceMasks = if (result.confidenceMasks().isPresent) {
      result.confidenceMasks().get().map { mask ->
        val bitmap = MediaPipeUtils.mpImageToBitmap(mask)
        val file = File.createTempFile("confidence_mask", ".png", moduleBase.reactContext.cacheDir)
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

    val categoryMasks = if (result.categoryMask().isPresent) {
      val mask = result.categoryMask().get()
      val bitmap = MediaPipeUtils.mpImageToBitmap(mask)
      val file = File.createTempFile("category_mask", ".png", moduleBase.reactContext.cacheDir)
      FileOutputStream(file).use { out ->
        bitmap.compress(Bitmap.CompressFormat.PNG, 100, out)
      }
      arrayOf(
        SegmentationMask(
          width = mask.width.toDouble(),
          height = mask.height.toDouble(),
          mask = file.absolutePath
        )
      )
    } else {
      emptyArray()
    }

    return ImageSegmenterResult(
      categoryMasks = categoryMasks,
      confidenceMasks = confidenceMasks
    )
  }

  override fun unload() {
    moduleBase.unload()
  }
}
