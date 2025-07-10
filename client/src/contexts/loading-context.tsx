import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { CoffeeRoasterLoader } from '@/components/ui/coffee-roaster-loader';

interface LoadingContextType {
  showLoader: (id: string) => void;
  hideLoader: (id: string) => void;
  isLoading: boolean;
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

export function LoadingProvider({ children }: { children: ReactNode }) {
  const [loadingOperations, setLoadingOperations] = useState<Set<string>>(new Set());

  const showLoader = useCallback((id: string) => {
    setLoadingOperations(prev => new Set(prev).add(id));
  }, []);

  const hideLoader = useCallback((id: string) => {
    setLoadingOperations(prev => {
      const newSet = new Set(prev);
      newSet.delete(id);
      return newSet;
    });
  }, []);

  const isLoading = loadingOperations.size > 0;

  return (
    <LoadingContext.Provider value={{ showLoader, hideLoader, isLoading }}>
      {children}
      {isLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 shadow-xl">
            <div className="flex flex-col items-center space-y-4">
              <CoffeeRoasterLoader className="w-16 h-16" />
              <p className="text-gray-700 font-medium">Roasting...</p>
            </div>
          </div>
        </div>
      )}
    </LoadingContext.Provider>
  );
}

export function useLoading() {
  const context = useContext(LoadingContext);
  if (!context) {
    throw new Error('useLoading must be used within a LoadingProvider');
  }
  return context;
}