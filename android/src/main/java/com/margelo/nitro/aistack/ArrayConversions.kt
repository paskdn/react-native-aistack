package com.margelo.nitro.aistack

/**
 * Utility class for converting between nested arrays and internal flat structures
 * to work around Nitrogen's nested array codegen issues.
 */
object ArrayConversions {

  /**
   * Convert Category[][] to InternalCategoryArray2D
   */
  fun categoryTo2D(array: Array<Array<Category>>): InternalCategoryArray2D {
    val items = mutableListOf<Category>()
    val lengths = mutableListOf<Double>()

    array.forEach { subArray ->
      lengths.add(subArray.size.toDouble())
      items.addAll(subArray)
    }

    return InternalCategoryArray2D(
      items = items.toTypedArray(),
      lengths = lengths.toDoubleArray()
    )
  }

  /**
   * Convert NormalizedLandmark[][] to InternalNormalizedLandmarkArray2D
   */
  fun normalizedLandmarkTo2D(array: Array<Array<NormalizedLandmark>>): InternalNormalizedLandmarkArray2D {
    val items = mutableListOf<NormalizedLandmark>()
    val lengths = mutableListOf<Double>()

    array.forEach { subArray ->
      lengths.add(subArray.size.toDouble())
      items.addAll(subArray)
    }

    return InternalNormalizedLandmarkArray2D(
      items = items.toTypedArray(),
      lengths = lengths.toDoubleArray()
    )
  }

  /**
   * Convert NormalizedLandmark[][][] to InternalNormalizedLandmarkArray3D
   */
  fun normalizedLandmarkTo3D(array: Array<Array<Array<NormalizedLandmark>>>): InternalNormalizedLandmarkArray3D {
    val items = mutableListOf<NormalizedLandmark>()
    val outerLengths = mutableListOf<Double>()
    val innerLengths = mutableListOf<Double>()

    array.forEach { outerArray ->
      outerLengths.add(outerArray.size.toDouble())
      outerArray.forEach { innerArray ->
        innerLengths.add(innerArray.size.toDouble())
        items.addAll(innerArray)
      }
    }

    return InternalNormalizedLandmarkArray3D(
      items = items.toTypedArray(),
      outerLengths = outerLengths.toDoubleArray(),
      innerLengths = innerLengths.toDoubleArray()
    )
  }

  /**
   * Convert Landmark[][] to InternalLandmarkArray2D
   */
  fun landmarkTo2D(array: Array<Array<Landmark>>): InternalLandmarkArray2D {
    val items = mutableListOf<Landmark>()
    val lengths = mutableListOf<Double>()

    array.forEach { subArray ->
      lengths.add(subArray.size.toDouble())
      items.addAll(subArray)
    }

    return InternalLandmarkArray2D(
      items = items.toTypedArray(),
      lengths = lengths.toDoubleArray()
    )
  }

  /**
   * Convert Landmark[][][] to InternalLandmarkArray3D
   */
  fun landmarkTo3D(array: Array<Array<Array<Landmark>>>): InternalLandmarkArray3D {
    val items = mutableListOf<Landmark>()
    val outerLengths = mutableListOf<Double>()
    val innerLengths = mutableListOf<Double>()

    array.forEach { outerArray ->
      outerLengths.add(outerArray.size.toDouble())
      outerArray.forEach { innerArray ->
        innerLengths.add(innerArray.size.toDouble())
        items.addAll(innerArray)
      }
    }

    return InternalLandmarkArray3D(
      items = items.toTypedArray(),
      outerLengths = outerLengths.toDoubleArray(),
      innerLengths = innerLengths.toDoubleArray()
    )
  }
}
