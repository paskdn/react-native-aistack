import { useState, useCallback } from 'react';

/**
 * A hook to cycle through a list of items.
 *
 * @param items The array of items to cycle through.
 * @returns An object containing the current item and a function to cycle to the next one.
 */
export function useCycle<T>(items: T[]) {
  const [index, setIndex] = useState(0);

  const next = useCallback(() => {
    setIndex((prevIndex) => (prevIndex + 1) % items.length);
  }, [items.length]);

  return {
    current: items[index]!,
    next,
  };
}
