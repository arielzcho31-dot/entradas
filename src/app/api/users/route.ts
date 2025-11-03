import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

interface User {
  id: string;
  display_name?: string;
  email: string;
  role: string;
  created_at: Date;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const role = searchParams.get('role');

    // Construir consulta con filtro opcional por rol
    let queryText = `SELECT id, display_name, email, role, created_at, ci, numero, usuario, universidad 
       FROM users`;
    
    const queryParams: string[] = [];
    if (role) {
      queryText += ` WHERE role = $1`;
      queryParams.push(role);
    }
    
    queryText += ` ORDER BY created_at DESC`;

    // Obtiene usuarios de la base de datos
    const result = await query<User>(queryText, queryParams);

    // Convertir snake_case a camelCase para el frontend
    const users = result.rows.map(user => ({
      id: user.id,
      displayName: user.display_name,
      email: user.email,
      role: user.role,
      createdAt: user.created_at,
      ci: (user as any).ci,
      numero: (user as any).numero,
      usuario: (user as any).usuario,
      universidad: (user as any).universidad,
    }));

    return NextResponse.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor al obtener usuarios' },
      { status: 500 }
    );
  }
}