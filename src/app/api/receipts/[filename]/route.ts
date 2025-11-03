import { NextRequest, NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import path from 'path';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ filename: string }> }
) {
  try {
    const { filename } = await context.params;
    
    // Validar el nombre del archivo para evitar path traversal
    if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
      return NextResponse.json({ error: 'Invalid filename' }, { status: 400 });
    }

    const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'receipts');
    const filePath = path.join(uploadsDir, filename);

    // Leer el archivo
    const fileBuffer = await readFile(filePath);
    
    // Determinar el tipo MIME basado en la extensión
    const ext = filename.split('.').pop()?.toLowerCase();
    let contentType = 'image/jpeg';
    
    if (ext === 'png') contentType = 'image/png';
    else if (ext === 'gif') contentType = 'image/gif';
    else if (ext === 'webp') contentType = 'image/webp';
    else if (ext === 'jpg' || ext === 'jpeg') contentType = 'image/jpeg';

    // Retornar la imagen con headers apropiados
    return new NextResponse(fileBuffer as unknown as BodyInit, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });

  } catch (error: any) {
    console.error('Error serving receipt image:', error);
    
    // Si el archivo no existe, retornar 404
    if (error.code === 'ENOENT') {
      return NextResponse.json({ error: 'Receipt not found' }, { status: 404 });
    }
    
    return NextResponse.json({ error: 'Error serving receipt' }, { status: 500 });
  }
}
