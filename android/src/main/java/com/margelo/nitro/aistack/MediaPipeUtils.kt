package com.margelo.nitro.aistack

import android.graphics.Bitmap
import android.graphics.BitmapFactory
import android.util.Log
import com.google.mediapipe.framework.image.ByteBufferExtractor
import com.google.mediapipe.framework.image.MPImage

/**
 * Utility class containing common helper functions for MediaPipe modules.
 * Provides standardized image processing, bitmap conversion, and error handling
 * following MediaPipe best practices.
 */
object MediaPipeUtils {

  private const val TAG = "MediaPipeUtils"

  /**
   * Converts an image file path to a Bitmap with optional preprocessing.
   * Handles image downsampling based on the provided options to reduce memory usage.
   * Ensures proper ARGB_8888 format for MediaPipe compatibility.
   *
   * @param path The file path to the image
   * @param options Optional preprocessing options for image resizing
   * @return A Bitmap object loaded from the file path in ARGB_8888 format
   * @throws IllegalArgumentException if the bitmap cannot be decoded
   */
  fun toBitmap(path: String, options: ImagePreprocessingOptions?): Bitmap {
    val bitmapOptions = BitmapFactory.Options()
    bitmapOptions.inJustDecodeBounds = true
    BitmapFactory.decodeFile(path, bitmapOptions)

    if (bitmapOptions.outHeight <= 0 || bitmapOptions.outWidth <= 0) {
      Log.e(TAG, "Invalid image dimensions for file: $path")
      throw IllegalArgumentException("Cannot decode image from path: $path")
    }

    var sampleSize = 1
    options?.let {
      val height = bitmapOptions.outHeight
      val width = bitmapOptions.outWidth
      val reqHeight = it.maxHeight?.toInt() ?: height
      val reqWidth = it.maxWidth?.toInt() ?: width

      while (height / sampleSize > reqHeight || width / sampleSize > reqWidth) {
        sampleSize *= 2
      }
    }

    bitmapOptions.inSampleSize = sampleSize
    bitmapOptions.inJustDecodeBounds = false

    val bitmap = BitmapFactory.decodeFile(path, bitmapOptions)
      ?: throw IllegalArgumentException("Failed to decode bitmap from path: $path")

    // Ensure ARGB_8888 format for MediaPipe compatibility
    return if (bitmap.config == Bitmap.Config.ARGB_8888) {
      bitmap
    } else {
      Log.d(TAG, "Converting bitmap to ARGB_8888 format")
      bitmap.copy(Bitmap.Config.ARGB_8888, false)
    }
  }

  /**
   * Delegate constants for MediaPipe tasks following sample app patterns.
   */
  const val DELEGATE_CPU = 0
  const val DELEGATE_GPU = 1
  const val OTHER_ERROR = 0
  const val GPU_ERROR = 1

  /**
   * Converts an MPImage to a Bitmap using the MediaPipe ByteBufferExtractor.

   *
   * @param mpImage The MPImage to convert
   * @return A Bitmap containing the image data
   */
  fun mpImageToBitmap(mpImage: MPImage): Bitmap {
    val byteBuffer = ByteBufferExtractor.extract(mpImage)
    val width = mpImage.width
    val height = mpImage.height

    val bitmap = Bitmap.createBitmap(width, height, Bitmap.Config.ARGB_8888)
    bitmap.copyPixelsFromBuffer(byteBuffer)
    return bitmap
  }
}
