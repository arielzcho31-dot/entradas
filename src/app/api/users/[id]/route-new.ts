import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import bcrypt from 'bcrypt';

interface User {
  id: string;
  email: string;
  password?: string;
  display_name?: string;
  role: string;
  ci?: string;
  usuario?: string;
  numero?: string;
  universidad?: string;
  updated_at: Date;
}

// Función para ACTUALIZAR un usuario (PUT)
export async function PUT(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    if (!id) {
      return NextResponse.json({ error: 'User ID is missing' }, { status: 400 });
    }

    const userData = await request.json();
    
    // Construir query dinámicamente basado en campos proporcionados
    const updates: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    // Email
    if (userData.email) {
      updates.push(`email = $${paramIndex}`);
      values.push(userData.email.toLowerCase());
      paramIndex++;
    }

    // Password (hashear si se proporciona)
    if (userData.password && userData.password.length > 0) {
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      updates.push(`password = $${paramIndex}`);
      values.push(hashedPassword);
      paramIndex++;
    }

    // Otros campos opcionales
    const optionalFields = ['display_name', 'role', 'ci', 'usuario', 'numero', 'universidad'];
    for (const field of optionalFields) {
      if (userData[field] !== undefined) {
        updates.push(`${field} = $${paramIndex}`);
        values.push(userData[field]);
        paramIndex++;
      }
    }

    if (updates.length === 0) {
      return NextResponse.json({ error: 'No hay campos para actualizar' }, { status: 400 });
    }

    // Agregar ID como último parámetro
    values.push(id);

    const result = await query<User>(
      `UPDATE users 
       SET ${updates.join(', ')}, updated_at = NOW() 
       WHERE id = $${paramIndex} 
       RETURNING id, email, display_name, role, ci, usuario, numero, universidad, created_at, updated_at`,
      values
    );

    if (result.rowCount === 0) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
    }

    return NextResponse.json(result.rows[0]);
  } catch (error: any) {
    console.error('Update user error:', error);
    
    // Manejar error de email duplicado
    if (error.code === '23505' && error.constraint === 'users_email_key') {
      return NextResponse.json({ error: 'El email ya está en uso' }, { status: 409 });
    }
    
    return NextResponse.json({ error: error.message || 'Error al actualizar usuario' }, { status: 500 });
  }
}

// Función para ELIMINAR un usuario (DELETE)
export async function DELETE(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    if (!id) {
      return NextResponse.json({ error: 'User ID is missing' }, { status: 400 });
    }

    // Eliminar usuario (las órdenes/tickets se manejan con ON DELETE SET NULL)
    const result = await query(
      'DELETE FROM users WHERE id = $1',
      [id]
    );

    if (result.rowCount === 0) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Usuario eliminado correctamente.' }, { status: 200 });
  } catch (error: any) {
    console.error('Delete user error:', error);
    return NextResponse.json({ error: error.message || 'Error al eliminar usuario' }, { status: 500 });
  }
}
