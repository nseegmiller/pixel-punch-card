import { useState, useCallback } from 'react';

interface UseAsyncActionOptions {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

interface UseAsyncActionResult<T extends unknown[]> {
  execute: (...args: T) => Promise<void>;
  loading: boolean;
  error: string | null;
  clearError: () => void;
}

export function useAsyncAction<T extends unknown[]>(
  action: (...args: T) => Promise<void>,
  options?: UseAsyncActionOptions
): UseAsyncActionResult<T> {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const execute = useCallback(
    async (...args: T) => {
      try {
        setLoading(true);
        setError(null);
        await action(...args);
        options?.onSuccess?.();
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Operation failed';
        setError(errorMessage);
        options?.onError?.(err instanceof Error ? err : new Error(errorMessage));
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [action, options]
  );

  const clearError = useCallback(() => setError(null), []);

  return { execute, loading, error, clearError };
}
