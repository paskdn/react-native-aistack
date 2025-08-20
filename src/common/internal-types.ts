/**
 * Internal types for Nitrogen codegen compatibility
 *
 * These types work around the Nitrogen C++ code generation bug where nested arrays
 * like Category[][] and NormalizedLandmark[][][] cause variable shadowing issues.
 *
 * We use flat arrays with metadata instead of nested arrays to avoid C++ codegen issues.
 */

/**
 * Generic internal representation of T[][] as a flat structure
 * Contains flattened data with metadata to reconstruct the 2D array
 */
export interface InternalArray2D<T> {
  /** Flattened array of all items */
  items: T[];
  /** Array of lengths for each sub-array to reconstruct 2D structure */
  lengths: number[];
}

/**
 * Generic internal representation of T[][][] as a flat structure
 * Contains flattened data with metadata to reconstruct the 3D array
 */
export interface InternalArray3D<T> {
  /** Flattened array of all items */
  items: T[];
  /** Array of lengths for the first dimension */
  outerLengths: number[];
  /** Array of lengths for each inner 2D array */
  innerLengths: number[];
}

/**
 * Conversion helpers for transforming between internal and external types
 */
export class ArrayConversions {
  /**
   * Convert T[][] to InternalArray2D<T>
   */
  static to2D<T>(arr: T[][]): InternalArray2D<T> {
    const items: T[] = [];
    const lengths: number[] = [];

    arr.forEach((subArray) => {
      lengths.push(subArray.length);
      items.push(...subArray);
    });

    return { items, lengths };
  }

  /**
   * Convert InternalArray2D<T> to T[][]
   */
  static from2D<T>(obj: InternalArray2D<T>): T[][] {
    const result: T[][] = [];
    let itemIndex = 0;

    obj.lengths.forEach((length: number) => {
      const subArray = obj.items.slice(itemIndex, itemIndex + length);
      result.push(subArray);
      itemIndex += length;
    });

    return result;
  }

  /**
   * Convert T[][][] to InternalArray3D<T>
   */
  static to3D<T>(arr: T[][][]): InternalArray3D<T> {
    const items: T[] = [];
    const outerLengths: number[] = [];
    const innerLengths: number[] = [];

    arr.forEach((outerArray) => {
      outerLengths.push(outerArray.length);
      outerArray.forEach((innerArray) => {
        innerLengths.push(innerArray.length);
        items.push(...innerArray);
      });
    });

    return { items, outerLengths, innerLengths };
  }

  /**
   * Convert InternalArray3D<T> to T[][][]
   */
  static from3D<T>(obj: InternalArray3D<T>): T[][][] {
    const result: T[][][] = [];
    let itemIndex = 0;
    let innerLengthIndex = 0;

    obj.outerLengths.forEach((outerLength: number) => {
      const outerArray: T[][] = [];

      for (let i = 0; i < outerLength; i++) {
        const innerLength = obj.innerLengths[innerLengthIndex] || 0;
        const innerArray = obj.items.slice(itemIndex, itemIndex + innerLength);
        outerArray.push(innerArray);
        itemIndex += innerLength;
        innerLengthIndex++;
      }

      result.push(outerArray);
    });

    return result;
  }
}
