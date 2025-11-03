import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const userId = formData.get('userId') as string | null;

    if (!file || !userId) {
      return NextResponse.json({ error: 'Faltan el archivo o el ID de usuario.' }, { status: 400 });
    }

    // Define la ruta del archivo dentro de public
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}-${Date.now()}.${fileExt}`;
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'receipts');
    const filePath = path.join(uploadsDir, fileName);

    // Crear directorio si no existe
    await mkdir(uploadsDir, { recursive: true });

    // Convertir el archivo a Buffer y guardarlo
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filePath, buffer);

    // URL pública del archivo - usar API route para servir en producción
    const receiptUrl = `/api/receipts/${fileName}`;

    return NextResponse.json({ receiptUrl });

  } catch (error: any) {
    console.error('Error en la API de subida:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
