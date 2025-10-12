import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET() {
  // Usamos createRouteHandlerClient que es la forma moderna y correcta
  // de manejar la autenticación en el backend de Next.js.
  const supabase = createRouteHandlerClient({ cookies });
  
  try {
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // Obtenemos el rol de los metadatos del usuario en la sesión
    const userRole = session.user.user_metadata.role || 'customer';
    const userId = session.user.id;

    return NextResponse.json({ 
      message: 'User role checked successfully',
      userId: userId,
      role: userRole 
    });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

