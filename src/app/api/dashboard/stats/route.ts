import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    // Contar total de usuarios
    const usersResult = await query('SELECT COUNT(*) as count FROM users');
    const totalUsers = parseInt(usersResult.rows[0].count);

    // Contar órdenes pendientes
    const pendingResult = await query(
      "SELECT COUNT(*) as count FROM orders WHERE status = 'pending'"
    );
    const pendingOrders = parseInt(pendingResult.rows[0].count);

    // Contar tickets vendidos (con order_id)
    const soldResult = await query(
      "SELECT COUNT(*) as count FROM tickets WHERE order_id IS NOT NULL"
    );
    const soldTickets = parseInt(soldResult.rows[0].count);

    // Contar tickets generados manualmente (sin order_id)
    const manualResult = await query(
      "SELECT COUNT(*) as count FROM tickets WHERE order_id IS NULL"
    );
    const manualTickets = parseInt(manualResult.rows[0].count);

    // Sumar ingresos totales de órdenes APROBADAS (este era el bug)
    const revenueResult = await query(
      "SELECT COALESCE(SUM(total_price), 0) as total FROM orders WHERE status = 'approved'"
    );
    const totalRevenue = parseFloat(revenueResult.rows[0].total);

    // Contar órdenes aprobadas
    const approvedResult = await query(
      "SELECT COUNT(*) as count FROM orders WHERE status = 'approved'"
    );
    const approvedOrders = parseInt(approvedResult.rows[0].count);

    return NextResponse.json({
      totalUsers,
      pendingOrders,
      approvedOrders,
      soldTickets,
      manualTickets,
      totalRevenue,
    });

  } catch (error: any) {
    console.error('Error fetching dashboard stats:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
