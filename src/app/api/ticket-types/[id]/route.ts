import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

// GET /api/ticket-types/[id] - Obtener un tipo de entrada específico
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    const result = await query(
      'SELECT * FROM ticket_types WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Tipo de entrada no encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json(result.rows[0]);

  } catch (error: any) {
    console.error('Error fetching ticket type:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PUT /api/ticket-types/[id] - Actualizar un tipo de entrada
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const body = await request.json();

    const updates: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    const allowedFields = ['name', 'description', 'price', 'quantity_available'];

    for (const [key, value] of Object.entries(body)) {
      if (allowedFields.includes(key) && value !== undefined) {
        // Validaciones específicas
        if (key === 'price') {
          const priceValue = parseFloat(value as string);
          if (isNaN(priceValue) || priceValue < 0) {
            return NextResponse.json(
              { error: 'El precio debe ser un número válido mayor o igual a 0' },
              { status: 400 }
            );
          }
          updates.push(`${key} = $${paramIndex}`);
          values.push(priceValue);
        } else if (key === 'quantity_available') {
          const quantity = parseInt(value as string);
          if (isNaN(quantity) || quantity < 0) {
            return NextResponse.json(
              { error: 'La cantidad debe ser un número entero mayor o igual a 0' },
              { status: 400 }
            );
          }
          updates.push(`${key} = $${paramIndex}`);
          values.push(quantity);
        } else {
          updates.push(`${key} = $${paramIndex}`);
          values.push(value);
        }
        paramIndex++;
      }
    }

    if (updates.length === 0) {
      return NextResponse.json(
        { error: 'No hay campos válidos para actualizar' },
        { status: 400 }
      );
    }

    values.push(id);

    const result = await query(
      `UPDATE ticket_types SET ${updates.join(', ')}, updated_at = NOW() WHERE id = $${paramIndex} RETURNING *`,
      values
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Tipo de entrada no encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json(result.rows[0]);

  } catch (error: any) {
    console.error('Error updating ticket type:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE /api/ticket-types/[id] - Eliminar un tipo de entrada
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    // Verificar si hay órdenes asociadas a este tipo de entrada
    const ordersCheck = await query(
      'SELECT COUNT(*) as count FROM orders WHERE ticket_type_id = $1',
      [id]
    );

    if (parseInt(ordersCheck.rows[0].count) > 0) {
      return NextResponse.json(
        { error: 'No se puede eliminar el tipo de entrada porque tiene órdenes asociadas' },
        { status: 400 }
      );
    }

    const result = await query(
      'DELETE FROM ticket_types WHERE id = $1 RETURNING id',
      [id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Tipo de entrada no encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'Tipo de entrada eliminado correctamente' });

  } catch (error: any) {
    console.error('Error deleting ticket type:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
