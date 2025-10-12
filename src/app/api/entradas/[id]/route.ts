import { NextRequest, NextResponse } from 'next/server';
import { updateEntradaStatus, deleteEntrada } from '@/lib/db-functions';

// PUT - Actualizar estado de entrada
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

    const updatedEntrada = await updateEntradaStatus(params.id, estado);
    
    if (!updatedEntrada) {
      return NextResponse.json(
        { error: 'Entrada no encontrada' },
        { status: 404 }
      );
    }

    return NextResponse.json(updatedEntrada);
  } catch (error) {
    console.error('Error updating entrada:', error);
    return NextResponse.json(
      { error: 'Error al actualizar entrada' },
      { status: 500 }
    );
  }
}

// DELETE - Eliminar entrada
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const deletedEntrada = await deleteEntrada(params.id);
    
    if (!deletedEntrada) {
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