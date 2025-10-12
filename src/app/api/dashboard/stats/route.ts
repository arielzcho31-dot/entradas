import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Inicializa Supabase con la clave de servicio para tener permisos de administrador
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  try {
    // Contar total de usuarios
    const { count: totalUsers, error: usersError } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true });

    // Contar órdenes pendientes
    const { count: pendingOrders, error: ordersError } = await supabase
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending');

    // Contar tickets vendidos (verificados, provenientes de ordenes aceptadas)
    const { count: soldTickets, error: soldTicketsError } = await supabase
      .from('tickets')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'verified')
      .not('order_id', 'is', null);

    // Contar tickets generados manualmente (verificados, sin order_id)
    const { count: manualTickets, error: manualTicketsError } = await supabase
      .from('tickets')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'verified')
      .is('order_id', null);

    // Sumar ingresos totales de órdenes verificadas y usadas
    const { data: revenueData, error: revenueError } = await supabase
      .from('orders')
      .select('totalPrice')
      .in('status', ['verified', 'used']);

    if (usersError || ordersError || soldTicketsError || manualTicketsError || revenueError) {
      console.error({ usersError, ordersError, soldTicketsError, manualTicketsError, revenueError });
      throw new Error('Error al obtener las estadísticas de la base de datos.');
    }

    const totalRevenue = revenueData?.reduce((acc, order) => acc + order.totalPrice, 0) ?? 0;

    return NextResponse.json({
      totalUsers: totalUsers ?? 0,
      pendingOrders: pendingOrders ?? 0,
      soldTickets: soldTickets ?? 0,
      manualTickets: manualTickets ?? 0,
      totalRevenue: totalRevenue,
    });

  } catch (error: any) {
    console.error('Error fetching dashboard stats:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
