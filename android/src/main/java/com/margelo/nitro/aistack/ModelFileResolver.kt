package com.margelo.nitro.aistack

import android.content.Context
import android.util.Log
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import java.io.File
import java.io.FileOutputStream
import java.net.URL

/**
 * A singleton helper for resolving MediaPipe model files.
 * It handles downloading, caching, and accessing models from app assets.
 * This is the designated "Resource Fetcher" as per the architecture design.
 */
object ModelFileResolver {
  private const val TAG = "ModelFileResolver"
  private const val MODEL_CACHE_DIR = "aistack_models"

  /**
   * Resolves a ModelSource to a local file path.
   *
   * @param source The ModelSource object from JavaScript.
   * @param context The Android context, needed for file system access.
   * @return The absolute local file path of the model.
   * @throws Exception if the model cannot be resolved.
   */
  suspend fun resolve(source: ModelSource, context: Context): String {
    return when (source) {
      is ModelSource.First -> {
        resolveFromUri(source.value.uri, context)
      }

      is ModelSource.Second -> {
        resolveFromBundle(source.value.bundle, context)
      }

      is ModelSource.Third -> {
        resolveFromFilePath(source.value.filePath, context)
      }
    }
  }

  private suspend fun resolveFromFilePath(filePath: String, context: Context): String =
    withContext(Dispatchers.IO) {
      val sourceFile = File(filePath)
      if (!sourceFile.exists()) {
        throw Error("Model file does not exist at path: $filePath")
      }

      // If the file is in a temporary or app-specific directory, use it directly.
      if (isDirectUsePath(filePath, context)) {
        Log.d(TAG, "Using model directly from path: $filePath")
        return@withContext filePath
      }

      val cacheDir = File(context.cacheDir, MODEL_CACHE_DIR)
      if (!cacheDir.exists()) {
        cacheDir.mkdirs()
      }

      val destinationFile = File(cacheDir, sourceFile.name)

      // If file with same name and size exists in cache, assume it's the same and use it.
      if (destinationFile.exists() && destinationFile.length() == sourceFile.length()) {
        Log.d(TAG, "Model already cached from file path: ${destinationFile.absolutePath}")
        return@withContext destinationFile.absolutePath
      }

      // If source is already in our cache directory, just return its path.
      if (sourceFile.absolutePath.startsWith(cacheDir.absolutePath)) {
        Log.d(
          TAG,
          "Model is already in cache directory, no copy needed: ${sourceFile.absolutePath}"
        )
        return@withContext sourceFile.absolutePath
      }

      Log.d(TAG, "Copying model from '$filePath' to cache: '${destinationFile.absolutePath}'")

      try {
        sourceFile.copyTo(destinationFile, overwrite = true)
        Log.d(TAG, "Successfully copied model to cache.")
        return@withContext destinationFile.absolutePath
      } catch (e: Exception) {
        Log.e(TAG, "Failed to copy model from file path to cache: $filePath", e)
        // Clean up partially copied file
        if (destinationFile.exists()) {
          destinationFile.delete()
        }
        throw Exception("Failed to copy model to cache from: $filePath", e)
      }
    }

  private suspend fun resolveFromBundle(bundlePath: String, context: Context): String =
    withContext(Dispatchers.IO) {
      val cacheDir = File(context.cacheDir, MODEL_CACHE_DIR)
      if (!cacheDir.exists()) cacheDir.mkdirs()

      val destinationFile = File(cacheDir, bundlePath)
      Log.d(
        TAG,
        "Resolving model from bundle: $bundlePath to ${destinationFile.absolutePath}"
      )

      // A simple existence check is sufficient for bundle assets, as they are immutable.
      if (destinationFile.exists()) {
        Log.d(TAG, "Model already cached from bundle: ${destinationFile.absolutePath}")
        return@withContext destinationFile.absolutePath
      }

      try {
        context.assets.open(bundlePath).use { inputStream ->
          FileOutputStream(destinationFile).use { outputStream ->
            inputStream.copyTo(outputStream)
          }
        }
        Log.d(TAG, "Successfully copied model from bundle to cache.")
        return@withContext destinationFile.absolutePath
      } catch (e: Exception) {
        Log.e(TAG, "Failed to copy model from bundle assets: $bundlePath", e)
        if (destinationFile.exists()) {
          destinationFile.delete()
        }
        throw Exception(
          "Failed to load model from bundle: '$bundlePath'. Make sure it's in 'src/main/assets'.",
          e
        )
      }
    }

  private suspend fun resolveFromUri(uri: String, context: Context): String =
    withContext(Dispatchers.IO) {
      val cacheDir = File(context.cacheDir, MODEL_CACHE_DIR)
      if (!cacheDir.exists()) cacheDir.mkdirs()

      val filename = uri.substring(uri.lastIndexOf('/') + 1)
      val destinationFile = File(cacheDir, filename)
      val partFile = File(cacheDir, "$filename.part")

      Log.d(TAG, "Resolving model from URI: $uri to ${destinationFile.absolutePath}")

      // For remote files, a simple existence check is often sufficient.
      // More robust validation (e.g., checking ETag or Last-Modified headers) could be added here.
      if (destinationFile.exists()) {
        Log.d(TAG, "Model already cached from URI: ${destinationFile.absolutePath}")
        return@withContext destinationFile.absolutePath
      }

      try {
        val url = URL(uri)
        url.openStream().use { inputStream ->
          FileOutputStream(partFile).use { outputStream ->
            inputStream.copyTo(outputStream)
          }
        }
        if (!partFile.renameTo(destinationFile)) {
          throw Exception("Failed to rename part file to final destination.")
        }

        Log.d(
          TAG,
          "Successfully downloaded model to cache: ${destinationFile.absolutePath}"
        )
        return@withContext destinationFile.absolutePath
      } catch (e: Exception) {
        Log.e(TAG, "Failed to download model from URI: $uri", e)
        if (partFile.exists()) {
          partFile.delete()
        }
        throw Exception("Failed to download model from URI: $uri", e)
      }
    }

  /**
   * Checks if a file path is in a location that can be used directly
   * without copying to the app's private cache.
   */
  private fun isDirectUsePath(filePath: String, context: Context): Boolean {
    // Paths under /data/local/tmp are NOT considered direct use because the TFLite XNNPack
    // delegate needs to write a cache file next to the model, which fails with a
    // permission error in /data/local/tmp. By forcing a copy to our cache, we ensure
    // TFLite has the necessary write permissions.


    val privateDirs = listOf(
      context.cacheDir.absolutePath,
      context.filesDir.absolutePath
    )
    return privateDirs.any { filePath.startsWith(it) }
  }
}
