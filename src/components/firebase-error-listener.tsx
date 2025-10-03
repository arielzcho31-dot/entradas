
'use client';

import { useEffect } from 'react';
import { errorEmitter } from '@/lib/error-emitter';
import { FirestorePermissionError } from '@/lib/errors';
import { useToast } from '@/hooks/use-toast';

export function FirebaseErrorListener() {
  const { toast } = useToast();

  useEffect(() => {
    const handleError = (error: FirestorePermissionError) => {
      console.error(error); // Log the detailed error for debugging

      // In a real app, you might use a more sophisticated logging service.
      // For development, we'll throw it to make it visible in Next.js overlay.
      if (process.env.NODE_ENV === 'development') {
        // This will be caught by the Next.js error overlay
        throw error;
      } else {
        // In production, show a generic toast to the user.
        toast({
          variant: 'destructive',
          title: 'Error de Permiso',
          description:
            'No tienes permiso para realizar esta acción. Contacta al administrador.',
        });
      }
    };

    errorEmitter.on('permission-error', handleError);

    return () => {
      errorEmitter.off('permission-error', handleError);
    };
  }, [toast]);

  return null; // This component does not render anything
}
