
import { useState, useEffect, useCallback } from 'react';

export const useKeyPress = (): Set<string> => {
  const [pressedKeys, setPressedKeys] = useState<Set<string>>(new Set());

  const handleKeyDown = useCallback(({ key }: KeyboardEvent) => {
    setPressedKeys(prevKeys => new Set(prevKeys).add(key.toLowerCase()));
  }, []);

  const handleKeyUp = useCallback(({ key }: KeyboardEvent) => {
    setPressedKeys(prevKeys => {
      const newKeys = new Set(prevKeys);
      newKeys.delete(key.toLowerCase());
      return newKeys;
    });
  }, []);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [handleKeyDown, handleKeyUp]);

  return pressedKeys;
};
