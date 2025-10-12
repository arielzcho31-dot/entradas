import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Inicializa un cliente de Supabase con la clave de servicio para tener permisos de administrador.
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const userId = formData.get('userId') as string | null;

    if (!file || !userId) {
      return NextResponse.json({ error: 'Faltan el archivo o el ID de usuario.' }, { status: 400 });
    }

    // Define la ruta del archivo en el bucket
    const fileExt = file.name.split('.').pop();
    const filePath = `${userId}-${Date.now()}.${fileExt}`;

    // Sube el archivo al bucket 'receipts'
    const { error: uploadError } = await supabaseAdmin.storage
      .from('receipts')
      .upload(filePath, file);

    if (uploadError) {
      throw new Error(`Error al subir el archivo: ${uploadError.message}`);
    }

    // Obtiene la URL pública del archivo recién subido
    const { data: publicUrlData } = supabaseAdmin.storage
      .from('receipts')
      .getPublicUrl(filePath);

    if (!publicUrlData?.publicUrl) {
      throw new Error('No se pudo obtener la URL pública del archivo.');
    }

    // Devuelve la URL pública para que el cliente la use
    return NextResponse.json({ receiptUrl: publicUrlData.publicUrl });

  } catch (error: any) {
    console.error('Error en la API de subida:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
