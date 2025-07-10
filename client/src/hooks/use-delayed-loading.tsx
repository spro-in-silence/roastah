import { useEffect, useRef } from 'react';
import { useLoading } from '@/contexts/loading-context';
import { nanoid } from 'nanoid';

export function useDelayedLoading(isLoading: boolean, delay: number = 500) {
  const { showLoader, hideLoader } = useLoading();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const loadingIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (isLoading) {
      // Generate a unique ID for this loading operation
      const loadingId = nanoid();
      loadingIdRef.current = loadingId;

      // Set a timeout to show the loader after the delay
      timeoutRef.current = setTimeout(() => {
        showLoader(loadingId);
      }, delay);
    } else {
      // Clear the timeout if loading finishes before delay
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }

      // Hide the loader if it was shown
      if (loadingIdRef.current) {
        hideLoader(loadingIdRef.current);
        loadingIdRef.current = null;
      }
    }

    // Cleanup on unmount
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (loadingIdRef.current) {
        hideLoader(loadingIdRef.current);
      }
    };
  }, [isLoading, delay, showLoader, hideLoader]);
}

// Higher-order component for automatic loading detection
export function withDelayedLoading<T extends Record<string, any>>(
  Component: React.ComponentType<T>,
  delay: number = 500
) {
  return function WrappedComponent(props: T) {
    const isLoading = props.isLoading || props.loading || false;
    useDelayedLoading(isLoading, delay);
    return <Component {...props} />;
  };
}