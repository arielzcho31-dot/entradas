import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

// GET /api/events/[id]/organizers - Listar organizadores del evento
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: eventId } = await context.params;

    const result = await query(
      `SELECT eo.user_id, eo.role, eo.added_at, u.email, u.display_name
       FROM event_organizers eo
       JOIN users u ON eo.user_id = u.id
       WHERE eo.event_id = $1
       ORDER BY eo.added_at ASC`,
      [eventId]
    );

    return NextResponse.json(result.rows);

  } catch (error: any) {
    console.error('Error fetching event organizers:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST /api/events/[id]/organizers - Agregar un organizador al evento
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: eventId } = await context.params;
    const body = await request.json();
    
    // Aceptar tanto user_id como userId
    const user_id = body.user_id || body.userId;
    const role = body.role;

    if (!user_id) {
      return NextResponse.json(
        { error: 'User ID es requerido' },
        { status: 400 }
      );
    }

    const validRoles = ['owner', 'organizer', 'validator'];
    const organizerRole = role || 'organizer';

    if (!validRoles.includes(organizerRole)) {
      return NextResponse.json(
        { error: 'Rol inválido. Use: owner, organizer, validator' },
        { status: 400 }
      );
    }

    // Verificar que el usuario existe
    const userCheck = await query(
      'SELECT id FROM users WHERE id = $1',
      [user_id]
    );

    if (userCheck.rows.length === 0) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    // Verificar que el evento existe
    const eventCheck = await query(
      'SELECT id FROM events WHERE id = $1',
      [eventId]
    );

    if (eventCheck.rows.length === 0) {
      return NextResponse.json(
        { error: 'Evento no encontrado' },
        { status: 404 }
      );
    }

    const result = await query(
      `INSERT INTO event_organizers (event_id, user_id, role)
       VALUES ($1, $2, $3)
       ON CONFLICT (event_id, user_id) 
       DO UPDATE SET role = $3, added_at = NOW()
       RETURNING *`,
      [eventId, user_id, organizerRole]
    );

    return NextResponse.json(result.rows[0], { status: 201 });

  } catch (error: any) {
    console.error('Error adding event organizer:', error);
    
    // Manejar error de foreign key
    if (error && typeof error === 'object' && 'code' in error && error.code === '23503') {
      return NextResponse.json(
        { error: 'El evento o usuario especificado no existe' },
        { status: 404 }
      );
    }

    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE /api/events/[id]/organizers - Eliminar un organizador del evento
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: eventId } = await context.params;
    
    // Aceptar userId tanto del query param como del body
    const { searchParams } = new URL(request.url);
    let userId = searchParams.get('userId');
    
    if (!userId) {
      const body = await request.json();
      userId = body.userId;
    }

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID es requerido como parámetro o en el body' },
        { status: 400 }
      );
    }

    const result = await query(
      'DELETE FROM event_organizers WHERE event_id = $1 AND user_id = $2 RETURNING *',
      [eventId, userId]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Organizador no encontrado para este evento' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'Organizador eliminado correctamente' });

  } catch (error: any) {
    console.error('Error removing event organizer:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
