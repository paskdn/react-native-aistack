package com.margelo.nitro.aistack

import com.facebook.proguard.annotations.DoNotStrip
import com.google.mediapipe.framework.image.BitmapImageBuilder
import com.google.mediapipe.tasks.core.BaseOptions
import com.google.mediapipe.tasks.vision.core.RunningMode as MediaPipeVisionRunningMode
import com.google.mediapipe.tasks.vision.imageembedder.ImageEmbedder
import com.google.mediapipe.tasks.vision.imageembedder.ImageEmbedderResult as MediaPipeImageEmbedderResult
import com.margelo.nitro.core.Promise
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext

@DoNotStrip
class ImageEmbedder : HybridImageEmbedderSpec() {

  private val moduleBase =
    MediaPipeModuleBase<ImageEmbedder, ImageEmbedderOptions>("NitroImageEmbedder")

  override fun initialize(source: ModelSource, options: ImageEmbedderOptions?): Promise<Unit> {
    return moduleBase.initializeWithCaching(source, options) { modelPath, opts ->
      val baseOptions = BaseOptions.builder()
        .setModelAssetPath(modelPath)
        .build()

      val runningMode = when (opts?.runningMode) {
        VisionRunningMode.IMAGE -> MediaPipeVisionRunningMode.IMAGE
        VisionRunningMode.DEFAULT -> MediaPipeVisionRunningMode.IMAGE
        null -> MediaPipeVisionRunningMode.IMAGE
      }

      val embedderOptions = ImageEmbedder.ImageEmbedderOptions.builder()
        .setBaseOptions(baseOptions)
        .setRunningMode(runningMode)
        .apply {
          opts?.l2Normalize?.let { setL2Normalize(it) }
          opts?.quantize?.let { setQuantize(it) }
        }
        .build()

      ImageEmbedder.createFromOptions(moduleBase.reactContext, embedderOptions)
    }
  }

  override fun embed(
    asset: AssetSource,
    options: ImagePreprocessingOptions?
  ): Promise<ImageEmbedderResult> {
    return Promise.async {
      val embedder = moduleBase.requireModule()
      val assetPath = AssetFileResolver.resolve(asset, moduleBase.reactContext)
      val bitmap = MediaPipeUtils.toBitmap(assetPath, options)
      val mpImage = BitmapImageBuilder(bitmap).build()

      val results = withContext(Dispatchers.Default) {
        embedder.embed(mpImage)
      }
      toImageEmbedderResult(results)
    }
  }


  override fun cosineSimilarity(embedding1: Embedding, embedding2: Embedding): Promise<Double> {
    return Promise.async {
      val mpEmbedding1 = toMediaPipeEmbedding(embedding1)
      val mpEmbedding2 = toMediaPipeEmbedding(embedding2)
      ImageEmbedder.cosineSimilarity(mpEmbedding1, mpEmbedding2)
    }
  }

  private fun toMediaPipeEmbedding(embedding: Embedding): com.google.mediapipe.tasks.components.containers.Embedding {
    return com.google.mediapipe.tasks.components.containers.Embedding.create(
      embedding.floatEmbedding?.map { it.toFloat() }?.toFloatArray() ?: floatArrayOf(),
      embedding.quantizedEmbedding?.map { it.toInt().toByte() }?.toByteArray() ?: byteArrayOf(),
      embedding.headIndex?.toInt() ?: 0,
      java.util.Optional.ofNullable(embedding.headName)
    )
  }

  private fun toImageEmbedderResult(result: MediaPipeImageEmbedderResult): ImageEmbedderResult {
    val embeddings = result.embeddingResult().embeddings().map { embedding ->
      Embedding(
        floatEmbedding = embedding.floatEmbedding().map { it.toDouble() }.toDoubleArray(),
        quantizedEmbedding = embedding.quantizedEmbedding().map { it.toDouble() }.toDoubleArray(),
        headIndex = embedding.headIndex().toDouble(),
        headName = embedding.headName().get()
      )
    }.toTypedArray()

    return ImageEmbedderResult(
      embeddings = embeddings
    )
  }

  override fun unload() {
    moduleBase.unload()
  }
}
