import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'
import bcrypt from 'bcrypt'
import { normalizeRole } from '@/lib/role-utils'

interface User {
  id: string;
  email: string;
  password: string;
  display_name?: string;
  role: string;
  ci?: string;
  usuario?: string;
  numero?: string;
  universidad?: string;
  created_at: Date;
}

export async function POST(request: NextRequest) {
  try {
    const userData = await request.json();
    const { email, password, displayName, ci, usuario, numero, universidad, role } = userData;

    // Validación básica
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email y contraseña son requeridos' },
        { status: 400 }
      );
    }

    // Validar campos obligatorios: CI, Celular, Email
    if (!ci || !numero || !email) {
      return NextResponse.json(
        { error: 'CI, Celular y Correo son campos obligatorios' },
        { status: 400 }
      );
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Email inválido' },
        { status: 400 }
      );
    }

    // Validar que CI solo contenga números
    if (!/^\d+$/.test(ci)) {
      return NextResponse.json(
        { error: 'La cédula (CI) debe contener solo números' },
        { status: 400 }
      );
    }

    // Validar que número solo contenga números
    if (!/^\d+$/.test(numero)) {
      return NextResponse.json(
        { error: 'El número de celular debe contener solo números' },
        { status: 400 }
      );
    }

    // Validar que usuario solo contenga letras, números y guiones bajos
    if (usuario && !/^[a-zA-Z0-9_]+$/.test(usuario)) {
      return NextResponse.json(
        { error: 'El usuario solo puede contener letras, números y guiones bajos' },
        { status: 400 }
      );
    }

    // Validar y normalizar el rol
    const normalizedRole = normalizeRole(role);

    // Validar longitud de contraseña
    if (password.length < 6) {
      return NextResponse.json(
        { error: 'La contraseña debe tener al menos 6 caracteres' },
        { status: 400 }
      );
    }

    // Verificar si el email ya existe
    const existingEmail = await query<User>(
      'SELECT id FROM users WHERE email = $1 LIMIT 1',
      [email.toLowerCase()]
    );

    if (existingEmail.rowCount && existingEmail.rowCount > 0) {
      return NextResponse.json(
        { error: 'El email ya está registrado' },
        { status: 409 }
      );
    }

    // Si se proporciona CI, verificar que no esté duplicado
    if (ci) {
      const existingCI = await query<User>(
        'SELECT id FROM users WHERE ci = $1 LIMIT 1',
        [ci]
      );

      if (existingCI.rowCount && existingCI.rowCount > 0) {
        return NextResponse.json(
          { error: 'El CI ya está registrado' },
          { status: 409 }
        );
      }
    }

    // Hashear la contraseña
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Crear el usuario en la base de datos
    const result = await query<User>(
      `INSERT INTO users (
        email, password, display_name, ci, usuario, numero, universidad, role
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING id, email, display_name, ci, usuario, numero, universidad, role, created_at`,
      [
        email.toLowerCase(),
        hashedPassword,
        displayName || null,
        ci || null,
        usuario || null,
        numero || null,
        universidad || null,
        normalizedRole
      ]
    );

    const newUser = result.rows[0];

    return NextResponse.json({
      message: 'Usuario registrado exitosamente',
      user: newUser,
    }, { status: 201 });

  } catch (error: any) {
    console.error('Register error:', error);
    
    // Manejar error de email duplicado (por si acaso)
    if (error.code === '23505' && error.constraint === 'users_email_key') {
      return NextResponse.json(
        { error: 'El email ya está registrado' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: 'Error al registrar usuario' },
      { status: 500 }
    );
  }
}