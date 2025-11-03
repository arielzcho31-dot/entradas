import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: order_id } = await context.params;

    const result = await query(
      'SELECT id FROM tickets WHERE order_id = $1',
      [order_id]
    );

    return NextResponse.json(result.rows);

  } catch (error: any) {
    console.error('Error fetching tickets for order:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: order_id } = await context.params;
    const { quantity } = await request.json();

    if (!quantity || quantity <= 0) {
      return NextResponse.json({ error: 'Quantity is required' }, { status: 400 });
    }

    // Obtener información completa de la orden
    const orderResult = await query(
      `SELECT 
        o.user_id, 
        o.event_id, 
        o.ticket_type_id,
        u.display_name as user_name,
        tt.name as ticket_name
      FROM orders o
      LEFT JOIN users u ON o.user_id = u.id
      LEFT JOIN ticket_types tt ON o.ticket_type_id = tt.id
      WHERE o.id = $1`,
      [order_id]
    );

    if (orderResult.rows.length === 0) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    const { user_id, event_id, ticket_type_id, user_name, ticket_name } = orderResult.rows[0];

    // Importar uuid
    const { v4: uuidv4 } = await import('uuid');

    // Verificar stock disponible
    const stockResult = await query(
      'SELECT quantity_available FROM ticket_types WHERE id = $1',
      [ticket_type_id]
    );

    if (stockResult.rows.length > 0 && stockResult.rows[0].quantity_available !== null) {
      const availableStock = stockResult.rows[0].quantity_available;
      
      if (availableStock < quantity) {
        return NextResponse.json({ 
          error: `Stock insuficiente. Solo quedan ${availableStock} entradas disponibles.` 
        }, { status: 400 });
      }

      // Descontar del stock
      await query(
        'UPDATE ticket_types SET quantity_available = quantity_available - $1 WHERE id = $2',
        [quantity, ticket_type_id]
      );
    }

    // Crear tickets con UUID y QR
    const tickets = [];
    for (let i = 0; i < quantity; i++) {
      const ticketUuid = uuidv4();
      
      console.log('Creando ticket:', {
        order_id,
        user_id,
        event_id,
        ticket_type_name: ticket_name,
        user_name,
        ticketUuid
      });

      const result = await query(
        `INSERT INTO tickets (
          order_id, user_id, event_id, ticket_type_name, user_name
        ) VALUES ($1, $2, $3, $4, $5)
        RETURNING *`,
        [
          order_id,
          user_id,
          event_id,
          ticket_name || 'Entrada General',
          user_name || 'Usuario'
        ]
      );
      tickets.push(result.rows[0]);
    }

    return NextResponse.json({
      success: true,
      tickets,
      message: `${quantity} ticket(s) creado(s) exitosamente. Stock actualizado.`
    }, { status: 201 });

  } catch (error: any) {
    console.error('Error creating tickets:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
