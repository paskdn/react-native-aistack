package com.margelo.nitro.aistack

import com.facebook.proguard.annotations.DoNotStrip
import com.google.mediapipe.tasks.text.languagedetector.LanguageDetector
import com.google.mediapipe.tasks.core.BaseOptions
import com.margelo.nitro.core.Promise
import android.util.Log
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext

@DoNotStrip
class LanguageDetector : HybridLanguageDetectorSpec() {

  private val moduleBase =
    MediaPipeModuleBase<LanguageDetector, LanguageDetectorOptions>("NitroLanguageDetector")

  override fun initialize(source: ModelSource, options: LanguageDetectorOptions?): Promise<Unit> {
    return moduleBase.initializeWithCaching(source, options) { modelPath, opts ->
      val baseOptions = BaseOptions.builder()
        .setModelAssetPath(modelPath)
        .build()

      val detectorOptions = LanguageDetector.LanguageDetectorOptions.builder()
        .setBaseOptions(baseOptions)
        .apply {
          opts?.scoreThreshold?.let { setScoreThreshold(it.toFloat()) }
          opts?.maxResults?.let { setMaxResults(it.toInt()) }
          opts?.categoryAllowlist?.let { setCategoryAllowlist(it.toList()) }
          opts?.categoryDenylist?.let { setCategoryDenylist(it.toList()) }
        }
        .build()

      LanguageDetector.createFromOptions(moduleBase.reactContext, detectorOptions)
    }
  }

  override fun detect(text: String): Promise<LanguageDetectorResult> {
    return Promise.async {
      try {
        val detector = moduleBase.requireModule()

        val results = withContext(Dispatchers.Default) {
          detector.detect(text)
        }
        val predictions = results.languagesAndScores().map {
          LanguagePrediction(
            languageCode = it.languageCode(),
            confidence = it.probability().toDouble()
          )
        }.toTypedArray()

        Log.d(
          moduleBase.tag,
          "Detection completed for text: ${text.take(50)}, results: ${predictions.size}"
        )
        LanguageDetectorResult(languages = predictions)
      } catch (e: RuntimeException) {
        throw IllegalStateException("Detection failed: ${e.message}", e)
      }
    }
  }

  override fun unload() {
    moduleBase.unload()
  }
}
