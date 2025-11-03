import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

// GET /api/events/[id]/stats - Obtener estadísticas de un evento
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: eventId } = await context.params;

    // Verificar que el evento existe
    const eventCheck = await query(
      'SELECT name FROM events WHERE id = $1',
      [eventId]
    );

    if (eventCheck.rows.length === 0) {
      return NextResponse.json(
        { error: 'Evento no encontrado' },
        { status: 404 }
      );
    }

    // Total de tipos de entrada
    const ticketTypesResult = await query(
      'SELECT COUNT(*) as count FROM ticket_types WHERE event_id = $1',
      [eventId]
    );

    // Estadísticas de órdenes por estado
    const ordersStatsResult = await query(
      `SELECT 
        COUNT(*) as total_ordenes,
        COUNT(CASE WHEN status = 'pending' THEN 1 END) as ordenes_pendientes,
        COUNT(CASE WHEN status = 'approved' THEN 1 END) as ordenes_aprobadas,
        COUNT(CASE WHEN status = 'rejected' THEN 1 END) as ordenes_rechazadas,
        COALESCE(SUM(total_price), 0) as ingresos_totales,
        COALESCE(SUM(CASE WHEN status = 'approved' THEN total_price ELSE 0 END), 0) as ingresos_aprobados,
        COALESCE(SUM(CASE WHEN status = 'pending' THEN total_price ELSE 0 END), 0) as ingresos_pendientes
      FROM orders 
      WHERE event_id = $1`,
      [eventId]
    );

    // Total de tickets vendidos
    const ticketsSoldResult = await query(
      'SELECT COUNT(*) as count FROM tickets WHERE event_id = $1 AND order_id IS NOT NULL',
      [eventId]
    );

    // Tickets usados
    const ticketsUsedResult = await query(
      'SELECT COUNT(*) as count FROM tickets WHERE event_id = $1 AND status = $2',
      [eventId, 'used']
    );

    // Capacidad total disponible
    const capacityResult = await query(
      'SELECT SUM(quantity_available) as total FROM ticket_types WHERE event_id = $1',
      [eventId]
    );

    const orderStats = ordersStatsResult.rows[0];

    return NextResponse.json({
      eventName: eventCheck.rows[0].name,
      ticketTypes: parseInt(ticketTypesResult.rows[0].count),
      totalOrders: parseInt(orderStats.total_ordenes) || 0,
      pendingOrders: parseInt(orderStats.ordenes_pendientes) || 0,
      approvedOrders: parseInt(orderStats.ordenes_aprobadas) || 0,
      rejectedOrders: parseInt(orderStats.ordenes_rechazadas) || 0,
      totalRevenue: parseFloat(orderStats.ingresos_totales) || 0,
      approvedRevenue: parseFloat(orderStats.ingresos_aprobados) || 0,
      pendingRevenue: parseFloat(orderStats.ingresos_pendientes) || 0,
      ticketsSold: parseInt(ticketsSoldResult.rows[0].count),
      ticketsUsed: parseInt(ticketsUsedResult.rows[0].count),
      totalCapacity: parseInt(capacityResult.rows[0].total) || 0,
    });

  } catch (error: any) {
    console.error('Error fetching event stats:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
