import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const { ticketName, userName, quantity, eventId } = await request.json();

    if (!ticketName || !userName || !quantity || quantity <= 0) {
      return NextResponse.json({ error: 'Nombre, usuario y cantidad son requeridos.' }, { status: 400 });
    }

    if (!eventId) {
      return NextResponse.json({ error: 'Event ID es requerido.' }, { status: 400 });
    }

    // Crear tickets con el nombre del usuario especificado
    const values: string[] = [];
    const params: any[] = [];
    
    for (let i = 0; i < quantity; i++) {
      const offset = i * 3;
      values.push(`($${offset + 1}, $${offset + 2}, $${offset + 3})`);
      params.push(eventId, 'verified', userName); // Usar userName del formulario
    }

    await query(
      `INSERT INTO tickets (event_id, status, user_name) 
       VALUES ${values.join(', ')}`,
      params
    );

    return NextResponse.json({ message: `${quantity} entradas generadas exitosamente para ${userName}.` }, { status: 201 });

  } catch (error: any) {
    console.error('Error generando tickets:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
