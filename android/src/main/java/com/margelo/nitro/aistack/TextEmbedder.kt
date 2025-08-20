package com.margelo.nitro.aistack

import android.util.Log
import com.facebook.proguard.annotations.DoNotStrip
import com.google.mediapipe.tasks.core.BaseOptions
import com.google.mediapipe.tasks.text.textembedder.TextEmbedder
import com.margelo.nitro.core.Promise
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext

@DoNotStrip
class TextEmbedder : HybridTextEmbedderSpec() {

  private val moduleBase =
    MediaPipeModuleBase<TextEmbedder, TextEmbedderOptions>("NitroTextEmbedder")

  override fun initialize(source: ModelSource, options: TextEmbedderOptions?): Promise<Unit> {
    return moduleBase.initializeWithCaching(source, options) { modelPath, opts ->
      val baseOptions = BaseOptions.builder()
        .setModelAssetPath(modelPath)
        .build()

      val embedderOptions = TextEmbedder.TextEmbedderOptions.builder()
        .setBaseOptions(baseOptions)
        .apply {
          opts?.l2Normalize?.let { setL2Normalize(it) }
          opts?.quantize?.let { setQuantize(it) }
        }
        .build()

      TextEmbedder.createFromOptions(moduleBase.reactContext, embedderOptions)
    }
  }

  override fun compare(text1: String, text2: String): Promise<Double> {
    return Promise.async {
      try {
        val embedder = moduleBase.requireModule()

        val firstEmbedding = withContext(Dispatchers.Default) {
          embedder.embed(text1).embeddingResult().embeddings().first()
        }
        val secondEmbedding = withContext(Dispatchers.Default) {
          embedder.embed(text2).embeddingResult().embeddings().first()
        }

        Log.d(
          moduleBase.tag,
          "Compared embeddings for texts: '${text1.take(30)}...' and '${text2.take(30)}...'"
        )
        TextEmbedder.cosineSimilarity(firstEmbedding, secondEmbedding)
      } catch (e: Exception) {
        Log.e(moduleBase.tag, "Embedding comparison failed", e)
        throw IllegalStateException("Embedding comparison failed: ${e.message}", e)
      }
    }
  }

  override fun embed(text: String): Promise<DoubleArray> {
    return Promise.async {
      try {
        val embedder = moduleBase.requireModule()

        val embeddings = withContext(Dispatchers.Default) {
          embedder.embed(text).embeddingResult().embeddings()
        }

        Log.d(moduleBase.tag, "Embedded text: $text")
        return@async embeddings.first().floatEmbedding().map { it.toDouble() }.toDoubleArray()
      } catch (e: RuntimeException) {
        throw IllegalStateException("Embedding failed: ${e.message}", e)
      }
    }
  }

  override fun unload() {
    moduleBase.unload()
  }
}
