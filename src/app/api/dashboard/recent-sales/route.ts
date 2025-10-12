import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select('id, userName, createdAt, totalPrice, quantity') // Añade id y quantity
      .in('status', ['verified', 'used'])
      .order('createdAt', { ascending: false })
      .limit(5);

    if (error) {
      throw error;
    }

    return NextResponse.json(data);

  } catch (error: any) {
    console.error('Error fetching recent sales:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
