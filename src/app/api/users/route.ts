import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Inicializa Supabase aquí
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  try {
    // Obtiene todos los usuarios de la base de datos
    const { data: users, error } = await supabase
      .from('users')
      .select('id, displayName, email, role, createdAt');

    if (error) {
      throw error;
    }

    return NextResponse.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor al obtener usuarios' },
      { status: 500 }
    );
  }
}