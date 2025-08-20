package com.margelo.nitro.aistack

import android.graphics.BitmapFactory
import android.util.Log
import androidx.core.net.toUri
import com.facebook.proguard.annotations.DoNotStrip
import com.facebook.react.bridge.ReactApplicationContext
import com.google.mediapipe.framework.image.BitmapImageBuilder
import com.google.mediapipe.tasks.genai.llminference.GraphOptions
import com.google.mediapipe.tasks.genai.llminference.LlmInference
import com.google.mediapipe.tasks.genai.llminference.LlmInferenceSession
import com.margelo.nitro.core.Promise
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import java.io.File
import com.google.mediapipe.tasks.genai.llminference.PromptTemplates as MediaPipePromptTemplates

@DoNotStrip
class LlmInferenceSession(
  private val reactContext: ReactApplicationContext,
  private val llmInference: LlmInference,
  private var sessionOptions: LlmSessionOptions?
) : HybridLlmInferenceSessionSpec() {
  companion object {
    private const val TAG = "NitroLlmSession"
  }

  private var session: LlmInferenceSession

  init {
    session = createSessionFromOptions(sessionOptions)
    Log.d(TAG, "LlmInferenceSession created.")
  }

  private fun createSessionFromOptions(options: LlmSessionOptions?): LlmInferenceSession {
    val sessionOptionsBuilder = LlmInferenceSession.LlmInferenceSessionOptions.builder()

    options?.topK?.let { sessionOptionsBuilder.setTopK(it.toInt()) }
    options?.topP?.let { sessionOptionsBuilder.setTopP(it.toFloat()) }
    options?.temperature?.let { sessionOptionsBuilder.setTemperature(it.toFloat()) }
    options?.randomSeed?.let { sessionOptionsBuilder.setRandomSeed(it.toInt()) }
    options?.loraPath?.let { sessionOptionsBuilder.setLoraPath(it) }
    options?.constraintHandle?.let { sessionOptionsBuilder.setConstraintHandle(it.toLong()) }

    options?.graphOptions?.let { graphOpts ->
      val graphOptionsBuilder = GraphOptions.builder()
      graphOpts.includeTokenCostCalculator?.let {
        graphOptionsBuilder.setIncludeTokenCostCalculator(
          it
        )
      }
      graphOpts.enableVisionModality?.let { graphOptionsBuilder.setEnableVisionModality(it) }
      sessionOptionsBuilder.setGraphOptions(graphOptionsBuilder.build())
    }

    options?.promptTemplates?.let { templates ->
      val promptTemplatesBuilder = MediaPipePromptTemplates.builder()
      templates.userPrefix?.let { promptTemplatesBuilder.setUserPrefix(it) }
      templates.userSuffix?.let { promptTemplatesBuilder.setUserSuffix(it) }
      templates.modelPrefix?.let { promptTemplatesBuilder.setModelPrefix(it) }
      templates.modelSuffix?.let { promptTemplatesBuilder.setModelSuffix(it) }
      templates.systemPrefix?.let { promptTemplatesBuilder.setSystemPrefix(it) }
      templates.systemSuffix?.let { promptTemplatesBuilder.setSystemSuffix(it) }
      sessionOptionsBuilder.setPromptTemplates(promptTemplatesBuilder.build())
    }

    return LlmInferenceSession.createFromOptions(llmInference, sessionOptionsBuilder.build())
  }

  override fun addQueryChunk(text: String) {
    session.addQueryChunk(text)
  }

  override fun addImage(image: ImageSource) {
    val uri = image.path.toUri()
    val bitmap = if (uri.scheme == "file") {
      BitmapFactory.decodeFile(File(uri.path!!).absolutePath)
    } else {
      val inputStream = reactContext.contentResolver.openInputStream(uri)
      BitmapFactory.decodeStream(inputStream)
    }
    val mpImage = BitmapImageBuilder(bitmap).build()
    session.addImage(mpImage)
  }

  override fun generateResponse(): Promise<GenerationResult> {
    return Promise.async {
      withContext(Dispatchers.Default) {
        val response = session.generateResponse()
        // This is a placeholder, as the actual API is unknown
        val tokenCost = TokenCost(promptTokenCount = 0.0, completionTokenCount = 0.0)
        val stats = PerformanceStats(
          timeToFirstToken = 0.0,
          decodeSpeed = 0.0,
          prefillSpeed = 0.0,
          tokenCost = tokenCost
        )
        GenerationResult(response, stats)
      }
    }
  }


  override fun sizeInTokens(text: String): Double {
    return session.sizeInTokens(text).toDouble()
  }

  override fun cloneSession(): HybridLlmInferenceSessionSpec {
    val clonedMediaPipeSession = session.cloneSession()
    return LlmInferenceSession(reactContext, llmInference, sessionOptions).apply {
      this.session = clonedMediaPipeSession
    }
  }

  override fun updateSessionOptions(options: LlmSessionOptions) {
    this.sessionOptions = options
    // Note: MediaPipe has updateSessionOptions but it's more complex -
    // for now we'll recreate the session which is simpler
    val oldSession = session
    session = createSessionFromOptions(options)
    oldSession.close()
  }

  override fun getSessionOptions(): LlmSessionOptions {
    return sessionOptions ?: LlmSessionOptions(
      topK = 40.0,
      topP = 1.0,
      temperature = 0.8,
      randomSeed = 0.0,
      loraPath = null,
      graphOptions = null,
      constraintHandle = null,
      promptTemplates = null
    )
  }

  override fun close() {
    session.close()

  }
}
