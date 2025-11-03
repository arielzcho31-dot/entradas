import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

// PUT - Actualizar estado de entrada (ticket)
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { estado } = await request.json();
    
    if (!estado) {
      return NextResponse.json(
        { error: 'Estado es requerido' },
        { status: 400 }
      );
    }

    const result = await query(
      'UPDATE tickets SET status = $1 WHERE id = $2 RETURNING *',
      [estado, params.id]
    );
    
    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Entrada no encontrada' },
        { status: 404 }
      );
    }

    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating entrada:', error);
    return NextResponse.json(
      { error: 'Error al actualizar entrada' },
      { status: 500 }
    );
  }
}

// DELETE - Eliminar entrada (ticket)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const result = await query(
      'DELETE FROM tickets WHERE id = $1 RETURNING *',
      [params.id]
    );
    
    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Entrada no encontrada' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'Entrada eliminada correctamente' });
  } catch (error) {
    console.error('Error deleting entrada:', error);
    return NextResponse.json(
      { error: 'Error al eliminar entrada' },
      { status: 500 }
    );
  }
}