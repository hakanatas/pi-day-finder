import { useState, useEffect } from 'react';
import type { PiDigitsState } from '../types';

export function usePiDigits(): PiDigitsState {
  const [state, setState] = useState<PiDigitsState>({
    digits: '',
    loaded: 0,
    total: 1_000_000,
    isLoading: true,
    error: null,
  });

  useEffect(() => {
    const loadPiDigits = async () => {
      try {
        const response = await fetch(`${import.meta.env.BASE_URL}pi-digits.txt`);

        if (!response.ok) {
          throw new Error('Pi digits dosyasi yuklenemedi');
        }

        const contentLength = response.headers.get('content-length');
        const total = contentLength ? parseInt(contentLength, 10) : 1_000_000;

        setState((prev) => ({ ...prev, total }));

        const reader = response.body?.getReader();
        if (!reader) {
          throw new Error('Stream okuyucu olusturulamadi');
        }

        const decoder = new TextDecoder();
        let digits = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          digits += decoder.decode(value, { stream: true });
          setState((prev) => ({
            ...prev,
            digits,
            loaded: digits.length,
          }));
        }

        // Final decode
        digits += decoder.decode();

        setState((prev) => ({
          ...prev,
          digits,
          loaded: digits.length,
          isLoading: false,
        }));
      } catch (error) {
        setState((prev) => ({
          ...prev,
          error: error as Error,
          isLoading: false,
        }));
      }
    };

    loadPiDigits();
  }, []);

  return state;
}
