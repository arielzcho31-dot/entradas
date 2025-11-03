import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

// GET /api/ticket-types - Listar tipos de entrada
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get('eventId');
    
    let queryText = 'SELECT * FROM ticket_types';
    const params: any[] = [];
    
    if (eventId) {
      queryText += ' WHERE event_id = $1';
      params.push(eventId);
    }
    
    queryText += ' ORDER BY price ASC';

    const result = await query(queryText, params);
    return NextResponse.json(result.rows);

  } catch (error: any) {
    console.error('Error fetching ticket types:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST /api/ticket-types - Crear un nuevo tipo de entrada
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { event_id, name, description, price, quantity_available } = body;

    // Validaciones básicas
    if (!event_id || !name || price === undefined || quantity_available === undefined) {
      return NextResponse.json(
        { error: 'Event ID, nombre, precio y cantidad son requeridos' },
        { status: 400 }
      );
    }

    // Validar que el precio sea un número válido
    if (isNaN(parseFloat(price)) || parseFloat(price) < 0) {
      return NextResponse.json(
        { error: 'El precio debe ser un número válido mayor o igual a 0' },
        { status: 400 }
      );
    }

    // Validar que la cantidad sea un número entero positivo
    if (!Number.isInteger(quantity_available) || quantity_available < 0) {
      return NextResponse.json(
        { error: 'La cantidad debe ser un número entero mayor o igual a 0' },
        { status: 400 }
      );
    }

    // Verificar que el evento existe
    const eventCheck = await query(
      'SELECT id FROM events WHERE id = $1',
      [event_id]
    );

    if (eventCheck.rows.length === 0) {
      return NextResponse.json(
        { error: 'El evento especificado no existe' },
        { status: 404 }
      );
    }

    const result = await query(
      `INSERT INTO ticket_types (event_id, name, description, price, quantity_available)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [event_id, name, description || null, parseFloat(price), quantity_available]
    );

    return NextResponse.json(result.rows[0], { status: 201 });

  } catch (error: any) {
    console.error('Error creating ticket type:', error);
    
    // Manejar error de foreign key (evento no existe)
    if (error && typeof error === 'object' && 'code' in error && error.code === '23503') {
      return NextResponse.json(
        { error: 'El evento especificado no existe' },
        { status: 404 }
      );
    }

    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
