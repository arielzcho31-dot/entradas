import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcrypt';
import config from '@/config';

const supabase = createClient(
  config.supabase.url!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Función para ACTUALIZAR un usuario (PUT)
export async function PUT(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params; // Await params (Next.js requirement)
    if (!id) {
      return NextResponse.json({ error: 'User ID is missing' }, { status: 400 });
    }

    const userData = await request.json();
    const { email, password, ...rest } = userData;
    const updatableData: any = { ...rest };

    if (password && password.length > 0) {
      updatableData.password = await bcrypt.hash(password, 10);
    }

    // (Opcional) Actualizar email en auth si se envía uno diferente
    if (email) {
      const { error: updateAuthError } = await supabase.auth.admin.updateUserById(id, { email });
      if (updateAuthError) {
        return NextResponse.json({ error: 'No se pudo actualizar el email en Auth.' }, { status: 400 });
      }
      updatableData.email = email;
    }
    // Sincroniza el rol en user_metadata de Auth si se envía uno diferente
    if (userData.role) {
      const { error: updateRoleError } = await supabase.auth.admin.updateUserById(id, {
        user_metadata: { role: userData.role }
      });
      if (updateRoleError) {
        return NextResponse.json({ error: 'No se pudo actualizar el rol en Auth.' }, { status: 400 });
      }
    }

    const { data, error } = await supabase
      .from('users')
      .update(updatableData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Update user error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Función para ELIMINAR un usuario (DELETE)
export async function DELETE(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params; // Await params (Next.js requirement)
    if (!id) {
      return NextResponse.json({ error: 'User ID is missing' }, { status: 400 });
    }

    // Eliminar primero de la tabla personalizada
    const { error: tableError } = await supabase
      .from('users')
      .delete()
      .eq('id', id);

    if (tableError) throw tableError;

    // Eliminar del Auth (si aún existe)
    const { error: authDeleteError } = await supabase.auth.admin.deleteUser(id);
    if (authDeleteError && authDeleteError.message !== 'User not found') {
      return NextResponse.json({ error: 'Usuario borrado de la tabla, pero no del Auth. Revisar manualmente.' }, { status: 500 });
    }

    return NextResponse.json({ message: 'Usuario eliminado exitosamente' });
  } catch (error: any) {
    console.error('Delete user error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}