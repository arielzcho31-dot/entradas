import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const orderId = searchParams.get('orderId');
    const ticketId = searchParams.get('id');
    const generated = searchParams.get('generated');
    
    let queryText = 'SELECT * FROM tickets';
    const params: any[] = [];
    const conditions: string[] = [];
    
    if (userId) {
      conditions.push(`user_id = $${params.length + 1}`);
      params.push(userId);
    }

    if (orderId) {
      conditions.push(`order_id = $${params.length + 1}`);
      params.push(orderId);
    }

    if (ticketId) {
      conditions.push(`id = $${params.length + 1}`);
      params.push(ticketId);
    }
    
    if (generated === 'true') {
      conditions.push('user_id IS NULL');
    }
    
    if (conditions.length > 0) {
      queryText += ' WHERE ' + conditions.join(' AND ');
    }
    
    queryText += ' ORDER BY created_at DESC';

    const result = await query(queryText, params);
    
    // Si buscamos por ID específico, devolver el primer resultado directamente
    if (ticketId && result.rows.length > 0) {
      return NextResponse.json(result.rows[0]);
    }
    
    return NextResponse.json(result.rows);

  } catch (error: any) {
    console.error('Error fetching tickets:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { orderId, userId, eventId, ticketName, quantity, userName } = body;

    if (!orderId || !userId || !eventId || !quantity) {
      return NextResponse.json(
        { error: 'Faltan campos requeridos' },
        { status: 400 }
      );
    }

    // Crear tickets según la cantidad solicitada
    const tickets = [];
    for (let i = 0; i < quantity; i++) {
      const result = await query(
        `INSERT INTO tickets (
          order_id, user_id, event_id, ticket_type_name, user_name
        ) VALUES ($1, $2, $3, $4, $5)
        RETURNING *`,
        [
          orderId,
          userId,
          eventId,
          ticketName || 'Entrada General',
          userName || 'Usuario'
        ]
      );
      tickets.push(result.rows[0]);
    }

    return NextResponse.json({
      success: true,
      tickets,
      message: `${quantity} ticket(s) creado(s) exitosamente`
    });

  } catch (error: any) {
    console.error('Error creating tickets:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const ticketId = searchParams.get('id');

    if (!ticketId) {
      return NextResponse.json(
        { error: 'Ticket ID is required' },
        { status: 400 }
      );
    }

    // Verificar que el ticket existe y no ha sido usado
    const checkResult = await query(
      'SELECT status, used_at FROM tickets WHERE id = $1',
      [ticketId]
    );

    if (checkResult.rows.length === 0) {
      return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
    }

    if (checkResult.rows[0].status === 'used') {
      return NextResponse.json({ 
        error: 'Ticket already used',
        used_at: checkResult.rows[0].used_at 
      }, { status: 400 });
    }

    // Marcar ticket como usado
    const result = await query(
      `UPDATE tickets 
       SET status = 'used', used_at = NOW()
       WHERE id = $1
       RETURNING *`,
      [ticketId]
    );

    return NextResponse.json({
      success: true,
      ticket: result.rows[0],
      message: 'Ticket marcado como usado exitosamente'
    });

  } catch (error: any) {
    console.error('Error updating ticket:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
