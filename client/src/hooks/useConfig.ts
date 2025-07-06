import { useState, useEffect } from 'react';
import { apiRequest } from '@/lib/queryClient';

interface Config {
  stripe: {
    publicKey: string;
  };
}

export function useConfig() {
  const [config, setConfig] = useState<Config | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadConfig = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const data = await apiRequest('GET', '/api/config');
        setConfig(data);
      } catch (err) {
        console.error('Failed to load configuration:', err);
        setError('Failed to load application configuration');
      } finally {
        setLoading(false);
      }
    };

    loadConfig();
  }, []);

  return { config, loading, error };
} 