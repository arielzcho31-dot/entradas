import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const result = await query(
      `SELECT id, user_id as "userName", created_at as "createdAt", total_price as "totalPrice", quantity
       FROM orders
       WHERE status IN ('verified', 'used')
       ORDER BY created_at DESC
       LIMIT 5`
    );

    return NextResponse.json(result.rows);

  } catch (error: any) {
    console.error('Error fetching recent sales:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
