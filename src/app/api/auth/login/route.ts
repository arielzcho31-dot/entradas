import { NextRequest } from 'next/server';
import db from '@/lib/database';
import { apiSuccess, apiError } from '@/lib/api-utils';
import { loginSchema } from '@/lib/validators';
import { createToken, createRefreshToken, setTokenCookies } from '@/lib/auth-utils';
import bcrypt from 'bcryptjs';

export async function POST(req: NextRequest) {
  try {
    // 1. Validar input
    const body = await req.json().catch(() => ({}));
    const validation = loginSchema.safeParse(body);
    
    if (!validation.success) {
      console.warn('Login validation failed:', validation.error);
      return apiError('Email o contraseña inválidos', 400);
    }

    const { email, password } = validation.data;
    console.log('🔐 Login attempt for:', email);

    // 2. Buscar usuario en BD (con debug)
    let result;
    try {
      const query = 'SELECT id, email, password, role, display_name FROM users WHERE LOWER(email) = LOWER($1) LIMIT 1';
      console.log('📤 Executing query:', query.substring(0, 50), '...');
      
      result = await db.query(query, [email]);
      
      console.log('📥 Query result rows:', result.rows.length);
      if (result.rows.length > 0) {
        console.log('👤 User found:', result.rows[0].email);
      } else {
        console.warn('❌ User NOT found in database for email:', email);
      }
    } catch (dbError) {
      console.error('❌ Database query error:', dbError);
      return apiError('Error al conectar con la base de datos', 500);
    }

    if (result.rows.length === 0) {
      return apiError('Email o contraseña inválidos', 401);
    }

    const user = result.rows[0];
    console.log('🔍 Found user:', {
      id: user.id,
      email: user.email,
      role: user.role,
      hasPasswordHash: !!user.password_hash,
    });

    // 3. Verificar contraseña
    let passwordValid = false;
    try {
      console.log('🔐 Verifying password...');
      passwordValid = await bcrypt.compare(password, user.password);
      console.log('✅ Password verification result:', passwordValid);
    } catch (bcryptError) {
      console.error('❌ Bcrypt error:', bcryptError);
      return apiError('Error al verificar contraseña', 500);
    }
    
    if (!passwordValid) {
      console.warn('❌ Invalid password for user:', email);
      return apiError('Email o contraseña inválidos', 401);
    }

    console.log('✅ Password valid, creating tokens...');

    // 4. Crear tokens
    const token = await createToken(user.id, user.email, user.role);
    const refreshToken = await createRefreshToken(user.id);

    console.log('✅ Login successful for:', email);

    // 5. Respuesta con cookies
    const response = apiSuccess({
      id: user.id,
      email: user.email,
      role: user.role,
      display_name: user.display_name,
      user_metadata: {
        displayName: user.display_name,
        role: user.role
      }
    });

    return setTokenCookies(response, token, refreshToken);

  } catch (error) {
    console.error('❌ Login error:', error);
    return apiError('Error interno del servidor', 500);
  }
}