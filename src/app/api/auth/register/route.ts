import { NextRequest } from 'next/server';
import db from '@/lib/database';
import { apiSuccess, apiError } from '@/lib/api-utils';
import { registerSchema } from '@/lib/validators';
import { createToken, createRefreshToken, setTokenCookies } from '@/lib/auth-utils';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

export async function POST(req: NextRequest) {
  try {
    // 1. Validar input
    const body = await req.json().catch(() => ({}));
    const validation = registerSchema.safeParse(body);
    
    if (!validation.success) {
      console.warn('Register validation failed:', validation.error);
      return apiError('Datos inválidos', 400);
    }

    const { email, password, display_name, ci, usuario, numero, universidad } = validation.data;
    console.log('✍️  Register attempt for:', email);

    // 2. Verificar que email no exista
    let existingUser;
    try {
      existingUser = await db.query(
        'SELECT id FROM users WHERE LOWER(email) = LOWER($1) LIMIT 1',
        [email]
      );
    } catch (dbError) {
      console.error('❌ Database error checking existing user:', dbError);
      return apiError('Error al conectar con la base de datos', 500);
    }

    if (existingUser.rows.length > 0) {
      console.warn('⚠️  Email already exists:', email);
      return apiError('El email ya está registrado', 409);
    }

    // 3. Hash de contraseña con bcryptjs
    console.log('🔐 Hashing password...');
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    console.log('✅ Password hashed. Hash length:', hashedPassword.length);

    // 4. Crear usuario
    const userId = uuidv4();
    console.log('👤 Creating user with ID:', userId);
    
    let user;
    try {
      const result = await db.query(
        `INSERT INTO users (id, email, password, display_name, ci, usuario, numero, universidad, role, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'user', NOW())
         RETURNING id, email, role, display_name`,
        [userId, email, hashedPassword, display_name, ci || null, usuario || null, numero || null, universidad || null]
      );

      user = result.rows[0];
      console.log('✅ User created:', user.email);
    } catch (dbError: any) {
      console.error('❌ Database error creating user:', dbError);
      
      if (dbError.code === '23505') {
        return apiError('El email ya está registrado', 409);
      }
      
      return apiError('Error al crear la cuenta', 500);
    }

    // 5. Crear tokens
    console.log('🔑 Creating tokens...');
    const token = await createToken(user.id, user.email, user.role);
    const refreshToken = await createRefreshToken(user.id);

    console.log('✅ Registration successful for:', email);

    // 6. Respuesta con cookies
    const response = apiSuccess({
      id: user.id,
      email: user.email,
      role: user.role,
      display_name: user.display_name,
      user_metadata: {
        displayName: user.display_name,
        role: user.role
      }
    }, 201);

    return setTokenCookies(response, token, refreshToken);

  } catch (error) {
    console.error('❌ Register error:', error);
    return apiError('Error al crear la cuenta', 500);
  }
}