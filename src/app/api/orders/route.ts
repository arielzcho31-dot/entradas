import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const userId = searchParams.get('userId');
    const eventId = searchParams.get('eventId');
    
    let queryText = `
      SELECT 
        o.*,
        u.display_name as user_name,
        u.email as user_email,
        tt.name as ticket_name,
        e.name as event_name
      FROM orders o
      LEFT JOIN users u ON o.user_id = u.id
      LEFT JOIN ticket_types tt ON o.ticket_type_id = tt.id
      LEFT JOIN events e ON o.event_id = e.id
    `;
    const params: any[] = [];
    const conditions: string[] = [];
    
    if (status) {
      conditions.push(`o.status = $${params.length + 1}`);
      params.push(status);
    }
    
    if (userId) {
      conditions.push(`o.user_id = $${params.length + 1}`);
      params.push(userId);
    }

    if (eventId) {
      conditions.push(`o.event_id = $${params.length + 1}`);
      params.push(eventId);
    }
    
    if (conditions.length > 0) {
      queryText += ' WHERE ' + conditions.join(' AND ');
    }
    
    queryText += ' ORDER BY o.created_at DESC';

    const result = await query(queryText, params);
    return NextResponse.json(result.rows);

  } catch (error: any) {
    console.error('Error fetching orders:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, eventId, ticketTypeId, quantity, totalPrice, receiptUrl, status } = body;

    // Verificar stock disponible antes de crear la orden
    const stockResult = await query(
      'SELECT quantity_available FROM ticket_types WHERE id = $1',
      [ticketTypeId]
    );

    if (stockResult.rows.length > 0 && stockResult.rows[0].quantity_available !== null) {
      const availableStock = stockResult.rows[0].quantity_available;
      
      if (availableStock < quantity) {
        return NextResponse.json({ 
          error: `Stock insuficiente. Solo quedan ${availableStock} entrada${availableStock !== 1 ? 's' : ''} disponible${availableStock !== 1 ? 's' : ''}.` 
        }, { status: 400 });
      }
      
      if (availableStock === 0) {
        return NextResponse.json({ 
          error: 'Lo sentimos, las entradas para este tipo están agotadas.' 
        }, { status: 400 });
      }
    }

    const result = await query(
      `INSERT INTO orders (user_id, event_id, ticket_type_id, quantity, total_price, receipt_url, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [userId, eventId, ticketTypeId, quantity, totalPrice, receiptUrl, status || 'pending']
    );

    return NextResponse.json(result.rows[0], { status: 201 });

  } catch (error: any) {
    console.error('Error creating order:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
