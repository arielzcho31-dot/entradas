import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

// GET /api/events/[id] - Obtener un evento específico (por ID o slug)
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    // Intentar buscar por UUID primero, luego por slug
    let result;
    
    // Verificar si es un UUID válido
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    
    if (uuidRegex.test(id)) {
      // Buscar por ID
      result = await query(
        'SELECT * FROM events WHERE id = $1',
        [id]
      );
    } else {
      // Buscar por slug
      result = await query(
        'SELECT * FROM events WHERE slug = $1',
        [id]
      );
    }

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Evento no encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json(result.rows[0]);

  } catch (error: any) {
    console.error('Error fetching event:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PUT /api/events/[id] - Actualizar un evento
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const body = await request.json();

    const updates: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    const allowedFields = ['name', 'description', 'category', 'event_date', 'location', 'image_url', 'status', 'is_informative', 'is_hidden'];

    for (const [key, value] of Object.entries(body)) {
      if (allowedFields.includes(key) && value !== undefined) {
        updates.push(`${key} = $${paramIndex}`);
        values.push(value);
        paramIndex++;
      }
    }

    if (updates.length === 0) {
      return NextResponse.json(
        { error: 'No hay campos válidos para actualizar' },
        { status: 400 }
      );
    }

    values.push(id);

    const result = await query(
      `UPDATE events SET ${updates.join(', ')}, updated_at = NOW() WHERE id = $${paramIndex} RETURNING *`,
      values
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Evento no encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json(result.rows[0]);

  } catch (error: any) {
    console.error('Error updating event:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE /api/events/[id] - Eliminar un evento
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    // Verificar si hay órdenes asociadas al evento
    const ordersCheck = await query(
      'SELECT COUNT(*) as count FROM orders WHERE event_id = $1',
      [id]
    );

    if (parseInt(ordersCheck.rows[0].count) > 0) {
      return NextResponse.json(
        { error: 'No se puede eliminar el evento porque tiene órdenes asociadas' },
        { status: 400 }
      );
    }

    // Eliminar tipos de entrada asociados primero
    await query('DELETE FROM ticket_types WHERE event_id = $1', [id]);

    // Eliminar el evento
    const result = await query(
      'DELETE FROM events WHERE id = $1 RETURNING id',
      [id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Evento no encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'Evento eliminado correctamente' });

  } catch (error: any) {
    console.error('Error deleting event:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
