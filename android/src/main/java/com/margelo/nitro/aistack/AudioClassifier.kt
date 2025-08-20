package com.margelo.nitro.aistack

import android.media.MediaCodec
import android.media.MediaExtractor
import android.media.MediaFormat
import com.facebook.proguard.annotations.DoNotStrip
import com.google.mediapipe.tasks.audio.audioclassifier.AudioClassifier
import com.google.mediapipe.tasks.components.containers.AudioData
import com.google.mediapipe.tasks.core.BaseOptions
import com.margelo.nitro.core.Promise
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import java.io.ByteArrayOutputStream
import java.io.IOException
import java.nio.ByteBuffer
import java.nio.ByteOrder
import kotlin.time.measureTimedValue
import com.google.mediapipe.tasks.audio.core.RunningMode as MediaPipeAudioRunningMode

private fun decodeAudioFile(filePath: String): Pair<ShortArray, Int> {
  val extractor = MediaExtractor()
  try {
    extractor.setDataSource(filePath)
    val trackIndex = (0 until extractor.trackCount).firstOrNull {
      val format = extractor.getTrackFormat(it)
      format.getString(MediaFormat.KEY_MIME)?.startsWith("audio/") == true
    } ?: throw IOException("No audio track found in file: $filePath")

    extractor.selectTrack(trackIndex)
    val format = extractor.getTrackFormat(trackIndex)
    val channels = format.getInteger(MediaFormat.KEY_CHANNEL_COUNT)
    val mime = format.getString(MediaFormat.KEY_MIME)!!
    val codec = MediaCodec.createDecoderByType(mime)
    codec.configure(format, null, null, 0)
    codec.start()

    val outputStream = ByteArrayOutputStream()
    val bufferInfo = MediaCodec.BufferInfo()

    var isInputEos = false
    while (true) {
      if (!isInputEos) {
        val inputBufferIndex = codec.dequeueInputBuffer(10000)
        if (inputBufferIndex >= 0) {
          val inputBuffer = codec.getInputBuffer(inputBufferIndex)
          if (inputBuffer != null) {
            val sampleSize = extractor.readSampleData(inputBuffer, 0)
            if (sampleSize < 0) {
              codec.queueInputBuffer(
                inputBufferIndex,
                0,
                0,
                0,
                MediaCodec.BUFFER_FLAG_END_OF_STREAM
              )
              isInputEos = true
            } else {
              codec.queueInputBuffer(inputBufferIndex, 0, sampleSize, extractor.sampleTime, 0)
              extractor.advance()
            }
          }
        }
      }

      val outputBufferIndex = codec.dequeueOutputBuffer(bufferInfo, 10000)
      if (outputBufferIndex >= 0) {
        val outputBuffer = codec.getOutputBuffer(outputBufferIndex)
        if (outputBuffer != null) {
          val chunk = ByteArray(bufferInfo.size)
          outputBuffer.get(chunk)
          outputStream.write(chunk)
        }
        codec.releaseOutputBuffer(outputBufferIndex, false)
      }

      if ((bufferInfo.flags and MediaCodec.BUFFER_FLAG_END_OF_STREAM) != 0) {
        break
      }
    }

    codec.stop()
    codec.release()
    extractor.release()

    val pcmData = outputStream.toByteArray()
    val shortArray = ShortArray(pcmData.size / 2)
    ByteBuffer.wrap(pcmData).order(ByteOrder.LITTLE_ENDIAN).asShortBuffer().get(shortArray)
    return Pair(shortArray, channels)
  } catch (e: Exception) {
    extractor.release()
    throw IOException("Failed to decode audio file: $filePath", e)
  }
}

@DoNotStrip
class AudioClassifier : HybridAudioClassifierSpec() {

  private val moduleBase =
    MediaPipeModuleBase<AudioClassifier, AudioClassifierOptions>("NitroAudioClassifier")

  override fun initialize(source: ModelSource, options: AudioClassifierOptions?): Promise<Unit> {
    return moduleBase.initializeWithCaching(source, options) { modelPath, opts ->
      val baseOptions = BaseOptions.builder()
        .setModelAssetPath(modelPath)
        .build()

      val runningMode = when (opts?.runningMode) {
        AudioRunningMode.AUDIO_CLIPS -> MediaPipeAudioRunningMode.AUDIO_CLIPS
        AudioRunningMode.DEFAULT -> MediaPipeAudioRunningMode.AUDIO_CLIPS
        null -> MediaPipeAudioRunningMode.AUDIO_CLIPS
      }

      val classifierOptions = AudioClassifier.AudioClassifierOptions.builder()
        .setBaseOptions(baseOptions)
        .setRunningMode(runningMode)
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

      AudioClassifier.createFromOptions(moduleBase.reactContext, classifierOptions)
    }
  }

  override fun classify(
    data: AssetSource,
    options: AudioPreprocessingOptions?
  ): Promise<AudioClassifierResult> {
    return Promise.async {
      val classifier = moduleBase.requireModule()
      val assetPath = AssetFileResolver.resolve(data, moduleBase.reactContext)

      val sampleRate = options?.sampleRate ?: 16000.0
      val (audioBuffer, channels) = decodeAudioFile(assetPath)

      val audioDataFormat = AudioData.AudioDataFormat.builder()
        .setSampleRate(sampleRate.toFloat())
        .setNumOfChannels(channels)
        .build()
      val audioData = AudioData.create(audioDataFormat, audioBuffer.size)
      audioData.load(audioBuffer)

      val timedResult = withContext(Dispatchers.Default) {
        measureTimedValue {
          classifier.classify(audioData)
        }
      }
      val results = timedResult.value
      val inferenceTime = timedResult.duration

      val classificationResults = extractClassificationResults(results)



      AudioClassifierResult(
        classificationResults = classificationResults,
        inferenceTime = inferenceTime.inWholeMilliseconds.toDouble()
      )
    }
  }

  private fun extractClassificationResults(results: com.google.mediapipe.tasks.audio.audioclassifier.AudioClassifierResult): Array<ClassificationResult> {
    return results.classificationResults().map { classificationResult ->
      val classifications = classificationResult.classifications().map { classifications ->
        Classifications(
          categories = classifications.categories().map { category ->
            Category(
              score = category.score().toDouble(),
              index = category.index().toDouble(),
              categoryName = category.categoryName(),
              displayName = category.displayName()
            )
          }.toTypedArray(),
          headIndex = 0.0, // MediaPipe Audio Classifier typically has single head
          headName = "" // Audio classifier doesn't provide head names
        )
      }.toTypedArray()

      ClassificationResult(
        classifications = classifications
      )
    }.toTypedArray()
  }

  override fun unload() {
    moduleBase.unload()
  }
}
