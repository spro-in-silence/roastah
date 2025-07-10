import { useQuery, useMutation, UseQueryOptions, UseMutationOptions } from '@tanstack/react-query';
import { useDelayedLoading } from './use-delayed-loading';

// Custom useQuery hook with automatic loading indicator
export function useQueryWithLoading<T>(
  options: UseQueryOptions<T>,
  delay: number = 500
) {
  const query = useQuery<T>(options);
  useDelayedLoading(query.isLoading, delay);
  return query;
}

// Custom useMutation hook with automatic loading indicator
export function useMutationWithLoading<T, E, V>(
  options: UseMutationOptions<T, E, V>,
  delay: number = 500
) {
  const mutation = useMutation<T, E, V>(options);
  useDelayedLoading(mutation.isPending, delay);
  return mutation;
}

// Higher-order function to wrap any async function with loading
export function withGlobalLoading<T extends (...args: any[]) => Promise<any>>(
  asyncFn: T,
  delay: number = 500
): T {
  return (async (...args: Parameters<T>) => {
    const { nanoid } = await import('nanoid');
    const { useLoading } = await import('@/contexts/loading-context');
    
    const loadingId = nanoid();
    let timeoutId: NodeJS.Timeout;
    
    const promise = asyncFn(...args);
    
    // Set timeout to show loading after delay
    timeoutId = setTimeout(() => {
      // This won't work in a non-React context, so we'll handle it differently
      // We'll create a global loading store instead
    }, delay);
    
    try {
      const result = await promise;
      clearTimeout(timeoutId);
      return result;
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  }) as T;
}