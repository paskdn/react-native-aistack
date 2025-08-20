package com.margelo.nitro.aistack

import android.util.Log
import com.facebook.react.bridge.ReactApplicationContext
import com.margelo.nitro.NitroModules
import com.margelo.nitro.core.Promise
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext

/**
 * Base class for MediaPipe modules that provides common initialization caching logic.
 * This prevents redundant model loading during Hot Module Replacement (HMR) and improves
 * development performance.
 *
 * @param T The type of the MediaPipe module (e.g., TextClassifier, TextEmbedder, LlmInference)
 * @param O The type of the options object for initialization
 * @param tag The logging tag for this module
 */
class MediaPipeModuleBase<T : AutoCloseable, O>(val tag: String) {
  val reactContext: ReactApplicationContext by lazy {
    NitroModules.applicationContext
      ?: throw IllegalStateException("ReactApplicationContext is not available")
  }

  private var currentModule: T? = null
  private var currentSource: ModelSource? = null
  private var currentOptions: O? = null

  /**
   * Initializes the MediaPipe module with caching to prevent redundant initialization.
   * If the module is already initialized with the same source and options, it will skip
   * re-initialization.
   *
   * @param source The model source configuration
   * @param options The module-specific options
   * @return Promise that completes when initialization is done
   */
  fun initializeWithCaching(
    source: ModelSource, options: O?, createModule: suspend (String, O?) -> T
  ): Promise<Unit> {
    return Promise.async {
      try {
        // Check if already initialized with the same parameters
        if (currentModule != null && currentSource == source && currentOptions == options) {
          Log.d(tag, "$tag is already initialized with the same configuration.")
          return@async
        }

        val modelPath = ModelFileResolver.resolve(source, reactContext)

        withContext(Dispatchers.Default) {
          // Close existing module if present
          currentModule?.close()

          // Create new module instance
          currentModule = createModule(modelPath, options)
          currentSource = source
          currentOptions = options

          Log.d(tag, "$tag initialized with model: $modelPath")
        }
      } catch (e: Exception) {
        Log.e(tag, "$tag initialization failed: ${e.message}", e)
        throw Error("$tag initialization failed: ${e.message}")
      }
    }
  }

  /**
   * Gets the current module instance, throwing an exception if not initialized.
   *
   * @return The current module instance
   * @throws IllegalStateException if the module is not initialized
   */
  fun requireModule(): T {
    return currentModule ?: throw IllegalStateException(
      "$tag is not initialized. Call initialize() first."
    )
  }

  /**
   * Gets the current module instance, returning null if not initialized.
   *
   * @return The current module instance or null
   */
  fun getModule(): T? = currentModule

  /**
   * Unloads the module and clears all cached state.
   */
  fun unloadModule() {
    try {
      currentModule?.close()
      currentModule = null
      currentSource = null
      currentOptions = null
      Log.d(tag, "$tag unloaded successfully")
    } catch (e: Exception) {
      Log.e(tag, "Failed to unload $tag", e)
    }
  }

  /**
   * Checks if the module is currently initialized.
   *
   * @return true if initialized, false otherwise
   */
  fun isInitialized(): Boolean = currentModule != null

  /**
   * Default implementation of unload() method for MediaPipe modules.
   * This can be overridden by derived classes if they need custom unload behavior.
   */
  fun unload() {
    unloadModule()
  }
}
