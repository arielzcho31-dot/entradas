import { NextRequest, NextResponse } from 'next/server';
import { createEntrada, getAllEntradas } from '@/lib/db-functions';

// GET - Obtener todas las entradas
export async function GET() {
  try {
    const entradas = await getAllEntradas();
    return NextResponse.json(entradas);
  } catch (error) {
    console.error('Error fetching entradas:', error);
    return NextResponse.json(
      { error: 'Error al obtener entradas' },
      { status: 500 }
    );
  }
}

// POST - Crear nueva entrada
export async function POST(request: NextRequest) {
  try {
    const entradaData = await request.json();
    
    if (!entradaData.userId || !entradaData.nombreEntrada || !entradaData.quantity) {
      return NextResponse.json(
        { error: 'Faltan campos requeridos' },
        { status: 400 }
      );
    }

    // Generar código QR único
    entradaData.codigoQR = entradaData.codigoQR || `QR-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    const newEntrada = await createEntrada(entradaData);
    return NextResponse.json(newEntrada, { status: 201 });
  } catch (error) {
    console.error('Error creating entrada:', error);
    return NextResponse.json(
      { error: 'Error al crear entrada' },
      { status: 500 }
    );
  }
}