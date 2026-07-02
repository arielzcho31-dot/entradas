// src/app/api/auth/logout/route.ts
import { NextRequest } from 'next/server';
import { apiSuccess } from '@/lib/api-utils';
import { clearTokenCookies } from '@/lib/auth-utils';

export async function POST(req: NextRequest) {
  try {
    // Limpiar cookies (no hay estado en servidor porque usamos JWT)
    const response = apiSuccess({ message: 'Sesión cerrada' });
    return clearTokenCookies(response);

  } catch (error) {
    console.error('Logout error:', error);
    // Incluso con error, limpiar cookies
    const errorResponse = apiSuccess({ message: 'Sesión cerrada' });
    return clearTokenCookies(errorResponse);
  }
}
