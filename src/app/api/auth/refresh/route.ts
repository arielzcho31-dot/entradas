// src/app/api/auth/refresh/route.ts
import { NextRequest } from 'next/server';
import db from '@/lib/database';
import { apiSuccess, apiError } from '@/lib/api-utils';
import { 
  verifyRefreshToken, 
  createToken, 
  createRefreshToken, 
  setTokenCookies,
  getTokenFromRequest 
} from '@/lib/auth-utils';

export async function POST(req: NextRequest) {
  try {
    // Obtener refresh token de cookies
    const cookieHeader = req.headers.get('cookie') || '';
    const refreshTokenCookie = cookieHeader
      .split(';')
      .map(c => c.trim())
      .find(c => c.startsWith('refreshToken='));

    if (!refreshTokenCookie) {
      return apiError('Refresh token no encontrado', 401);
    }

    const refreshToken = refreshTokenCookie.substring('refreshToken='.length);

    // Verificar refresh token
    const payload = await verifyRefreshToken(refreshToken);
    if (!payload) {
      return apiError('Refresh token inválido', 401);
    }

    // Obtener usuario
    const result = await db.query(
      'SELECT id, email, role, display_name FROM users WHERE id = $1 LIMIT 1',
      [payload.userId]
    );

    if (result.rows.length === 0) {
      return apiError('Usuario no encontrado', 404);
    }

    const user = result.rows[0];

    // Crear nuevos tokens
    const newToken = await createToken(user.id, user.email, user.role);
    const newRefreshToken = await createRefreshToken(user.id);

    const response = apiSuccess({
      id: user.id,
      email: user.email,
      role: user.role,
      display_name: user.display_name
    });

    return setTokenCookies(response, newToken, newRefreshToken);

  } catch (error) {
    console.error('Refresh token error:', error);
    return apiError('Error al refrescar token', 500);
  }
}
