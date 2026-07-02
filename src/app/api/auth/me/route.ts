// src/app/api/auth/me/route.ts
import { NextRequest } from 'next/server';
import db from '@/lib/database';
import { apiSuccess, apiError } from '@/lib/api-utils';
import { verifyAuthFromRequest } from '@/lib/auth-utils';

export async function GET(req: NextRequest) {
  try {
    console.log('📋 /api/auth/me called');
    
    // Verificar token desde cookies
    const payload = await verifyAuthFromRequest(req);
    
    if (!payload) {
      console.warn('❌ No valid token found');
      return apiError('No autorizado', 401);
    }

    console.log('✅ Token verified for user:', payload.userId);

    // Obtener datos actualizados del usuario
    const result = await db.query(
      'SELECT id, email, role, display_name FROM users WHERE id = $1 LIMIT 1',
      [payload.userId]
    );

    if (result.rows.length === 0) {
      console.warn('❌ User not found:', payload.userId);
      return apiError('Usuario no encontrado', 404);
    }

    const user = result.rows[0];
    console.log('👤 User found:', user.email);

    return apiSuccess({
      id: user.id,
      email: user.email,
      role: user.role,
      display_name: user.display_name,
      user_metadata: {
        displayName: user.display_name,
        role: user.role
      }
    });

  } catch (error) {
    console.error('❌ Get user error:', error);
    return apiError('Error interno del servidor', 500);
  }
}
