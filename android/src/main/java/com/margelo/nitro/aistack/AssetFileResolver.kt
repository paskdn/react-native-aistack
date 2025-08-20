package com.margelo.nitro.aistack

import android.content.Context
import android.util.Log
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import java.io.File
import java.io.FileOutputStream
import java.net.URL

/**
 * A singleton helper for resolving media asset files.
 * It handles downloading, caching, and accessing assets from app assets or local file paths.
 * This is designed to mirror the functionality of ModelFileResolver but for media assets.
 */
object AssetFileResolver {
  private const val TAG = "AssetFileResolver"
  private const val ASSET_CACHE_DIR = "aistack_assets"

  /**
   * Resolves an AssetSource to a local file path.
   *
   * @param source The AssetSource object from JavaScript.
   * @param context The Android context, needed for file system access.
   * @return The absolute local file path of the asset.
   * @throws Exception if the asset cannot be resolved.
   */
  suspend fun resolve(source: AssetSource, context: Context): String {
    return when (source) {
      is AssetSource.First -> {
        // This is a UriAssetSource
        resolveFromUri(source.value.uri, source.value.headers, context)
      }
      is AssetSource.Second -> {
        // This is a BundleAssetSource
        resolveFromBundle(source.value.bundle, context)
      }
      is AssetSource.Third -> {
        // This is a FilePathAssetSource
        resolveFromFilePath(source.value.filePath, context)
      }
    }
  }

  private suspend fun resolveFromFilePath(filePath: String, context: Context): String =
    withContext(Dispatchers.IO) {
      val sourceFile = File(filePath)
      if (!sourceFile.exists()) {
        throw Exception("Asset file does not exist at path: $filePath")
      }

      // For assets, we often need to process them, so copying to a managed cache is safer.
      // This also helps with managing permissions and file formats.
      val cacheDir = File(context.cacheDir, ASSET_CACHE_DIR)
      if (!cacheDir.exists()) {
        cacheDir.mkdirs()
      }

      val destinationFile = File(cacheDir, sourceFile.name)

      // If file with same name and size exists in cache, assume it's the same and use it.
      if (destinationFile.exists() && destinationFile.length() == sourceFile.length()) {
        Log.d(TAG, "Asset already cached from file path: ${destinationFile.absolutePath}")
        return@withContext destinationFile.absolutePath
      }

      Log.d(TAG, "Copying asset from '$filePath' to cache: '${destinationFile.absolutePath}'")
      sourceFile.copyTo(destinationFile, overwrite = true)
      return@withContext destinationFile.absolutePath
    }

  private suspend fun resolveFromBundle(bundlePath: String, context: Context): String =
    withContext(Dispatchers.IO) {
      val cacheDir = File(context.cacheDir, ASSET_CACHE_DIR)
      if (!cacheDir.exists()) cacheDir.mkdirs()

      val destinationFile = File(cacheDir, bundlePath.substringAfterLast('/'))

      if (destinationFile.exists()) {
        Log.d(TAG, "Asset already cached from bundle: ${destinationFile.absolutePath}")
        return@withContext destinationFile.absolutePath
      }

      Log.d(TAG, "Copying asset from bundle: $bundlePath to ${destinationFile.absolutePath}")
      context.assets.open(bundlePath).use { inputStream ->
        FileOutputStream(destinationFile).use { outputStream ->
          inputStream.copyTo(outputStream)
        }
      }
      return@withContext destinationFile.absolutePath
    }

  private suspend fun resolveFromUri(uri: String, headers: Map<String, String>?, context: Context): String =
    withContext(Dispatchers.IO) {
      val cacheDir = File(context.cacheDir, ASSET_CACHE_DIR)
      if (!cacheDir.exists()) cacheDir.mkdirs()

      val filename = uri.substring(uri.lastIndexOf('/') + 1)
      val destinationFile = File(cacheDir, filename)

      if (destinationFile.exists()) {
        Log.d(TAG, "Asset already cached from URI: ${destinationFile.absolutePath}")
        return@withContext destinationFile.absolutePath
      }

      
      val connection = URL(uri).openConnection()
      headers?.forEach { (key, value) ->
        connection.setRequestProperty(key, value)
      }

      connection.getInputStream().use { inputStream ->
        FileOutputStream(destinationFile).use { outputStream ->
          inputStream.copyTo(outputStream)
        }
      }
      return@withContext destinationFile.absolutePath
    }
}
