import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import config from '@/config';

export async function GET() {
  // Usamos createRouteHandlerClient que es la forma moderna y correcta
  // de manejar la autenticación en el backend de Next.js.
  const supabase = createRouteHandlerClient({ cookies });
  
  try {
    // 1. Verificar la sesión del usuario que hace la petición
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      return new NextResponse(JSON.stringify({ error: 'Not authenticated' }), { status: 401, headers: { 'Content-Type': 'application/json' } });
    }

    // 2. Verificar el rol del usuario
    const userRole = session.user.user_metadata.role;
    if (userRole !== 'admin' && userRole !== 'validador') {
      return new NextResponse(JSON.stringify({ error: 'Forbidden' }), { status: 403, headers: { 'Content-Type': 'application/json' } });
    }

    // 3. Si el rol es correcto, usar un cliente admin para obtener TODAS las órdenes
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data, error } = await supabaseAdmin
      .from('orders')
      .select('*')
      .eq('status', 'pending')
      .order('createdAt', { ascending: false });

    if (error) {
      throw error;
    }

    return NextResponse.json(data);

  } catch (error: any) {
    console.error('Error fetching orders:', error);
    return new NextResponse(JSON.stringify({ error: error.message }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}
