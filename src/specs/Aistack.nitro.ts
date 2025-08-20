import type { HybridObject } from 'react-native-nitro-modules';

export interface Aistack extends HybridObject<{ android: 'kotlin' }> {
  /**
   * Multiplies two numbers. This is a placeholder method for demonstrating
   * native module integration and is not part of the core AI functionality.
   * @param a The first number.
   * @param b The second number.
   * @returns The product of the two numbers.
   */
  multiply(a: number, b: number): number;
}
