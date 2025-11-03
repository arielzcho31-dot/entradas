import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

// GET /api/companies - Listar todas las empresas
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    
    let queryText = 'SELECT * FROM companies';
    const params: any[] = [];
    
    if (status) {
      queryText += ' WHERE status = $1';
      params.push(status);
    }
    
    queryText += ' ORDER BY name ASC';

    const result = await query(queryText, params);
    return NextResponse.json(result.rows);

  } catch (error: any) {
    console.error('Error fetching companies:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST /api/companies - Crear una nueva empresa
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description, contact_email, contact_phone, status } = body;

    // Validaciones básicas
    if (!name) {
      return NextResponse.json(
        { error: 'El nombre de la empresa es requerido' },
        { status: 400 }
      );
    }

    // Validar que el status sea válido
    const validStatuses = ['active', 'inactive'];
    const companyStatus = status || 'active';
    
    if (!validStatuses.includes(companyStatus)) {
      return NextResponse.json(
        { error: 'Estado inválido. Use: active, inactive' },
        { status: 400 }
      );
    }

    const result = await query(
      `INSERT INTO companies (name, description, contact_email, contact_phone, status)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [name, description || null, contact_email || null, contact_phone || null, companyStatus]
    );

    return NextResponse.json(result.rows[0], { status: 201 });

  } catch (error: any) {
    console.error('Error creating company:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
