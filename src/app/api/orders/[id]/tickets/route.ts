import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import config from '@/config'; // Importamos la configuración

const supabase = createClient(
  config.supabase.url!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // Obtenemos la clave secreta directamente
);

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const order_id = params.id;

    const { data, error } = await supabase
      .from('tickets')
      .select('id') // Solo necesitamos el ID para el QR
      .eq('order_id', order_id);

    if (error) {
      throw error;
    }

    return NextResponse.json(data);

  } catch (error: any) {
    console.error('Error fetching tickets for order:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
