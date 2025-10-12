import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const { ticketName, quantity } = await request.json();

    if (!ticketName || !quantity || quantity <= 0) {
      return NextResponse.json({ error: 'Nombre y cantidad son requeridos.' }, { status: 400 });
    }

    const ticketsToCreate = Array.from({ length: quantity }).map(() => ({
      ticket_name: ticketName,
      user_name: 'Invitado', // Nombre genérico
      status: 'verified',
      // No se asigna user_id ni order_id
    }));

    const { error } = await supabase.from('tickets').insert(ticketsToCreate);

    if (error) {
      throw error;
    }

    return NextResponse.json({ message: `${quantity} entradas generadas exitosamente.` }, { status: 201 });

  } catch (error: any) {
    console.error('Error generando tickets:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
