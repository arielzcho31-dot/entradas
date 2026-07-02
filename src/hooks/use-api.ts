// src/hooks/use-api.ts
// Hook para hacer requests API seguros con renovación automática de tokens

import { useCallback } from 'react';
import { useAuth } from '@/context/auth-context';

export interface RequestOptions extends RequestInit {
  params?: Record<string, string | number | boolean>;
}

export function useApi() {
  const { refreshAuth } = useAuth();

  const request = useCallback(async <T,>(
    endpoint: string,
    options: RequestOptions = {}
  ): Promise<T> => {
    try {
      const url = new URL(endpoint, process.env.NEXT_PUBLIC_APP_URL);
      
      if (options.params) {
        Object.entries(options.params).forEach(([key, value]) => {
          url.searchParams.append(key, String(value));
        });
      }

      const response = await fetch(url.toString(), {
        ...options,
        credentials: 'include', // Incluir cookies
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });

      // Si token expiró (401), intentar refresh
      if (response.status === 401) {
        const refreshed = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/auth/refresh`, {
          method: 'POST',
          credentials: 'include',
        });

        if (refreshed.ok) {
          // Reintentar la solicitud original
          return request<T>(endpoint, options);
        } else {
          // Refresh falló, redirigir a login
          await refreshAuth();
          throw new Error('Session expired');
        }
      }

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || `HTTP ${response.status}`);
      }

      return response.json();
    } catch (error) {
      console.error(`API request error for ${endpoint}:`, error);
      throw error;
    }
  }, [refreshAuth]);

  return { request };
}
