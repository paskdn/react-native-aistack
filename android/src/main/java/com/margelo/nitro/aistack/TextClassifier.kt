package com.margelo.nitro.aistack

import android.util.Log
import com.facebook.proguard.annotations.DoNotStrip
import com.google.mediapipe.tasks.core.BaseOptions
import com.google.mediapipe.tasks.text.textclassifier.TextClassifier
import com.margelo.nitro.core.Promise
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext

@DoNotStrip
class TextClassifier : HybridTextClassifierSpec() {

  private val moduleBase =
    MediaPipeModuleBase<TextClassifier, TextClassifierOptions>("NitroTextClassifier")

  override fun initialize(source: ModelSource, options: TextClassifierOptions?): Promise<Unit> {
    return moduleBase.initializeWithCaching(source, options) { modelPath, opts ->
      val baseOptions = BaseOptions.builder()
        .setModelAssetPath(modelPath)
        .build()

      val classifierOptions = TextClassifier.TextClassifierOptions.builder()
        .setBaseOptions(baseOptions)
        .apply {
          opts?.maxResults?.let { maxResults ->
            setMaxResults(maxResults.toInt())
          }
          opts?.scoreThreshold?.let { scoreThreshold ->
            setScoreThreshold(scoreThreshold.toFloat())
          }
          opts?.categoryAllowlist?.let { setCategoryAllowlist(it.toList()) }
          opts?.categoryDenylist?.let { setCategoryDenylist(it.toList()) }
          opts?.displayNamesLocale?.let { setDisplayNamesLocale(it) }
        }
        .build()

      TextClassifier.createFromOptions(moduleBase.reactContext, classifierOptions)
    }
  }

  override fun classify(text: String): Promise<TextClassifierResult> {
    return Promise.async {
      try {
        val classifier = moduleBase.requireModule()

        val results = withContext(Dispatchers.Default) {
          classifier.classify(text)
        }

        val classifications =
          results.classificationResult().classifications().flatMap { classification ->
            classification.categories().map { category ->
              Category(
                score = category.score().toDouble(),
                index = category.index().toDouble(),
                categoryName = category.categoryName() ?: "",
                displayName = category.displayName() ?: ""
              )
            }
          }.toTypedArray()

        Log.d(
          moduleBase.tag,
          "Classification completed for text: ${text.take(50)}, results: ${classifications.size}"
        )
        TextClassifierResult(classifications = classifications)
      } catch (e: RuntimeException) {
        throw IllegalStateException("Classification failed: ${e.message}", e)
      }
    }
  }

  override fun unload() {
    moduleBase.unload()
  }
}
