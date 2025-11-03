import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    // Obtener el userId desde los headers o query params
    const userId = request.headers.get('x-user-id') || request.nextUrl.searchParams.get('userId')

    if (!userId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    // Consultar el rol del usuario en PostgreSQL
    const result = await query(
      'SELECT id, role FROM users WHERE id = $1',
      [userId]
    )

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const user = result.rows[0]

    return NextResponse.json({ 
      message: 'User role checked successfully',
      userId: user.id,
      role: user.role 
    })

  } catch (error: unknown) {
    console.error('Error checking user role:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

