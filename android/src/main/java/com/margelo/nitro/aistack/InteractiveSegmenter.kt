package com.margelo.nitro.aistack

import android.graphics.Bitmap
import android.util.Log
import com.facebook.proguard.annotations.DoNotStrip
import com.google.mediapipe.framework.image.BitmapImageBuilder
import com.google.mediapipe.tasks.components.containers.NormalizedKeypoint
import com.google.mediapipe.tasks.core.BaseOptions
import com.google.mediapipe.tasks.core.Delegate as MediaPipeDelegate
import com.google.mediapipe.tasks.vision.imagesegmenter.ImageSegmenterResult as MediaPipeImageSegmenterResult
import com.google.mediapipe.tasks.vision.interactivesegmenter.InteractiveSegmenter
import com.google.mediapipe.tasks.vision.interactivesegmenter.InteractiveSegmenter.RegionOfInterest as MediaPipeRegionOfInterest
import com.margelo.nitro.core.Promise
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import java.io.File
import java.io.FileOutputStream

@DoNotStrip
class InteractiveSegmenter : HybridInteractiveSegmenterSpec() {

  companion object {
    private const val TAG = "NitroInteractiveSegmenter"
  }

  private val moduleBase =
    MediaPipeModuleBase<InteractiveSegmenter, InteractiveSegmenterOptions>("NitroInteractiveSegmenter")

  override fun initialize(
    source: ModelSource,
    options: InteractiveSegmenterOptions?
  ): Promise<Unit> {
    return moduleBase.initializeWithCaching(source, options) { modelPath, opts ->
      val requestedDelegate = opts?.delegate ?: Delegate.CPU

      Log.d(TAG, "InteractiveSegmenter initialization - Delegate: $requestedDelegate")

      val baseOptionsBuilder = BaseOptions.builder()
        .setModelAssetPath(modelPath)

      // Configure delegate
      when (requestedDelegate) {
        Delegate.CPU -> {
          baseOptionsBuilder.setDelegate(MediaPipeDelegate.CPU)
          Log.d(TAG, "Using CPU delegate for interactive segmentation")
        }

        Delegate.GPU -> {
          baseOptionsBuilder.setDelegate(MediaPipeDelegate.GPU)
          Log.d(TAG, "Using GPU delegate for interactive segmentation")
        }
      }

      val baseOptions = baseOptionsBuilder.build()

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
        val segmenterOptions = InteractiveSegmenter.InteractiveSegmenterOptions.builder()
          .setBaseOptions(baseOptions)
          .apply {
            setOutputCategoryMask(finalCategoryMask)
            setOutputConfidenceMasks(finalConfidenceMasks)
          }
          .build()

        InteractiveSegmenter.createFromOptions(moduleBase.reactContext, segmenterOptions)
      } catch (e: IllegalStateException) {
        Log.e(TAG, "Interactive segmenter failed to initialize: ${e.message}")
        throw IllegalStateException(
          "Interactive segmentation initialization failed. See logs for details.",
          e
        )

        throw RuntimeException(
          "Interactive segmentation failed to initialize. This may be due to GPU incompatibility or emulator limitations. " +
            "Try using CPU delegate or test on a physical device.", e
        )
      }
    }
  }

  override fun segment(
    asset: AssetSource,
    regionOfInterest: com.margelo.nitro.aistack.RegionOfInterest,
    options: ImagePreprocessingOptions?
  ): Promise<InteractiveSegmenterResult> {
    return Promise.async {
      val segmenter = moduleBase.requireModule()
      val assetPath = AssetFileResolver.resolve(asset, moduleBase.reactContext)
      val bitmap = MediaPipeUtils.toBitmap(assetPath, options)

      val mpImage = BitmapImageBuilder(bitmap).build()

      val mpRegionOfInterest = MediaPipeRegionOfInterest.create(
        NormalizedKeypoint.create(
          regionOfInterest.point?.x?.toFloat() ?: 0.5f,
          regionOfInterest.point?.y?.toFloat() ?: 0.5f
        )
      )

      val results = withContext(Dispatchers.Default) {
        segmenter.segment(mpImage, mpRegionOfInterest)
      }
      toInteractiveSegmenterResult(results)
    }
  }

  private fun toInteractiveSegmenterResult(result: MediaPipeImageSegmenterResult): InteractiveSegmenterResult {
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
          mask = "file://${file.absolutePath}"
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
          mask = "file://${file.absolutePath}"
        )
      )
    } else {
      emptyArray()
    }

    return InteractiveSegmenterResult(
      categoryMasks = categoryMasks,
      confidenceMasks = confidenceMasks
    )
  }

  override fun unload() {
    moduleBase.unload()
  }
}
