import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const eventId = searchParams.get('eventId');

    let whereClause = '';
    let params: any[] = [];

    if (eventId && eventId !== 'all') {
      // Estadísticas de un evento específico
      whereClause = 'WHERE o.event_id = $1';
      params = [eventId];
    } else if (userId) {
      // Estadísticas de todos los eventos del organizador
      whereClause = `
        WHERE o.event_id IN (
          SELECT e.id FROM events e
          INNER JOIN event_organizers eo ON e.id = eo.event_id
          WHERE eo.user_id = $1
        )
      `;
      params = [userId];
    } else {
      // Sin userId ni eventId específico = estadísticas globales (para validator/admin)
      whereClause = '';
      params = [];
    }

    // Calcular estadísticas agrupadas por estado
    const statsQuery = `
      SELECT 
        COUNT(CASE WHEN o.status = 'pending' THEN 1 END) as ordenes_pendientes,
        COUNT(CASE WHEN o.status = 'approved' THEN 1 END) as ordenes_aprobadas,
        COUNT(CASE WHEN o.status = 'rejected' THEN 1 END) as ordenes_rechazadas,
        COALESCE(SUM(CASE WHEN o.status = 'pending' THEN o.total_price ELSE 0 END), 0) as ingresos_pendientes,
        COALESCE(SUM(CASE WHEN o.status = 'approved' THEN o.total_price ELSE 0 END), 0) as ingresos_aprobados,
        COALESCE(SUM(CASE WHEN o.status = 'rejected' THEN o.total_price ELSE 0 END), 0) as ingresos_rechazados,
        COUNT(*) as total_ordenes,
        COALESCE(SUM(o.total_price), 0) as ingresos_totales
      FROM orders o
      ${whereClause}
    `;

    const result = await query(statsQuery, params);
    const stats = result.rows[0];

    // Convertir a números
    const response = {
      ordenes_pendientes: parseInt(stats.ordenes_pendientes) || 0,
      ordenes_aprobadas: parseInt(stats.ordenes_aprobadas) || 0,
      ordenes_rechazadas: parseInt(stats.ordenes_rechazadas) || 0,
      ingresos_pendientes: parseFloat(stats.ingresos_pendientes) || 0,
      ingresos_aprobados: parseFloat(stats.ingresos_aprobados) || 0,
      ingresos_rechazados: parseFloat(stats.ingresos_rechazados) || 0,
      total_ordenes: parseInt(stats.total_ordenes) || 0,
      ingresos_totales: parseFloat(stats.ingresos_totales) || 0,
    };

    return NextResponse.json(response);

  } catch (error: any) {
    console.error('Error fetching organizer stats:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
