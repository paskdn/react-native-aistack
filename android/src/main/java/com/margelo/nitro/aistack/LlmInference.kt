package com.margelo.nitro.aistack

import com.facebook.proguard.annotations.DoNotStrip
import com.margelo.nitro.core.Promise
import com.google.mediapipe.tasks.genai.llminference.LlmInference as MediaPipeLlmInference
import com.google.mediapipe.tasks.genai.llminference.VisionModelOptions as MediaPipeVisionModelOptions


@DoNotStrip
class LlmInference : HybridLlmInferenceSpec() {
  private val moduleBase =
    MediaPipeModuleBase<MediaPipeLlmInference, LlmInferenceOptions>("NitroLlmInference")

  override fun initialize(source: ModelSource, options: LlmInferenceOptions?): Promise<Unit> {
    return moduleBase.initializeWithCaching(source, options) { modelPath, opts ->
      val engineOptionsBuilder = MediaPipeLlmInference.LlmInferenceOptions.builder()
        .setModelPath(modelPath)

      opts?.maxTokens?.let { engineOptionsBuilder.setMaxTokens(it.toInt()) }
      opts?.maxTopK?.let { engineOptionsBuilder.setMaxTopK(it.toInt()) }
      opts?.maxNumImages?.let { engineOptionsBuilder.setMaxNumImages(it.toInt()) }

      opts?.supportedLoraRanks?.let { ranks ->
        engineOptionsBuilder.setSupportedLoraRanks(ranks.map { it.toInt() })
      }

      opts?.visionModelOptions?.let { visionOptions ->
        val visionModelOptionsBuilder = MediaPipeVisionModelOptions.builder()
        visionOptions.encoderPath?.let { visionModelOptionsBuilder.setEncoderPath(it) }
        visionOptions.adapterPath?.let { visionModelOptionsBuilder.setAdapterPath(it) }
        engineOptionsBuilder.setVisionModelOptions(visionModelOptionsBuilder.build())
      }

      opts?.preferredBackend?.let { backend ->
        val mediaPipeBackend = when (backend) {
          Backend.CPU -> MediaPipeLlmInference.Backend.CPU
          Backend.GPU -> MediaPipeLlmInference.Backend.GPU
        }
        engineOptionsBuilder.setPreferredBackend(mediaPipeBackend)
      }

      MediaPipeLlmInference.createFromOptions(moduleBase.reactContext, engineOptionsBuilder.build())
    }
  }

  override fun createSession(options: LlmSessionOptions?): LlmInferenceSession {
    val engine = moduleBase.requireModule()
    return LlmInferenceSession(moduleBase.reactContext, engine, options)
  }

  override fun generateResponse(prompt: String): Promise<GenerationResult> {
    return Promise.async {
      val session = createSession(null)
      try {
        session.addQueryChunk(prompt)
        session.generateResponse().await()
      } finally {
        session.close()
      }
    }
  }


  override fun sizeInTokens(text: String): Double {
    val engine = moduleBase.requireModule()
    return engine.sizeInTokens(text).toDouble()
  }

  override fun getSentencePieceProcessorHandle(): Double {
    val engine = moduleBase.requireModule()
    return engine.sentencePieceProcessorHandle.toDouble()
  }

  override fun unload() {
    moduleBase.unload()
  }
}
