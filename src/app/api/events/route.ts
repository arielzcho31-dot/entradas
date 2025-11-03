import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { generateUniqueSlug } from '@/lib/slug-utils';

// GET /api/events - Listar todos los eventos
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const createdBy = searchParams.get('createdBy');
    const userId = searchParams.get('userId'); // Para filtrar por empresa
    const userRole = searchParams.get('userRole'); // Para saber si es admin
    
    let queryText = 'SELECT * FROM events';
    const params: any[] = [];
    const conditions: string[] = [];
    
    // Si es organizador, filtrar por eventos propios + asignados
    if (userId && userRole === 'organizer') {
      // Obtener eventos creados por el usuario O asignados a él
      queryText = `
        SELECT DISTINCT e.* FROM events e
        LEFT JOIN event_organizers eo ON e.id = eo.event_id
        WHERE (e.created_by = $1 OR eo.user_id = $1)
      `;
      params.push(userId);
      
      // Aplicar filtro de status si existe
      if (status) {
        queryText += ` AND e.status = $${params.length + 1}`;
        params.push(status);
      }
      
      queryText += ' ORDER BY e.event_date DESC';
      const result = await query(queryText, params);
      return NextResponse.json(result.rows);
    }
    
    // Si es admin, mostrar todos los eventos (puede filtrar por company_id opcionalmente)
    if (userId && userRole === 'admin') {
      // Admin ve todos, sin filtro adicional
    } else if (userId) {
      // Otros roles: filtrar por company_id
      const userResult = await query('SELECT company_id FROM users WHERE id = $1', [userId]);
      if (userResult.rows.length > 0 && userResult.rows[0].company_id) {
        conditions.push(`company_id = $${params.length + 1}`);
        params.push(userResult.rows[0].company_id);
      }
    }
    
    if (status) {
      conditions.push(`status = $${params.length + 1}`);
      params.push(status);
    }
    
    if (createdBy) {
      conditions.push(`created_by = $${params.length + 1}`);
      params.push(createdBy);
    }
    
    if (conditions.length > 0) {
      queryText += ' WHERE ' + conditions.join(' AND ');
    }
    
    queryText += ' ORDER BY event_date DESC';

    const result = await query(queryText, params);
    return NextResponse.json(result.rows);

  } catch (error: any) {
    console.error('Error fetching events:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST /api/events - Crear un nuevo evento
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description, category, event_date, location, image_url, status, created_by, is_informative } = body;

    // Validaciones básicas
    if (!name || !event_date || !created_by) {
      return NextResponse.json(
        { error: 'Nombre, fecha del evento y creador son requeridos' },
        { status: 400 }
      );
    }

    // Validar que el status sea válido
    const validStatuses = ['draft', 'active', 'completed', 'cancelled'];
    const eventStatus = status || 'active';
    
    if (!validStatuses.includes(eventStatus)) {
      return NextResponse.json(
        { error: 'Estado inválido. Use: draft, active, completed, cancelled' },
        { status: 400 }
      );
    }

    // Obtener company_id del usuario que crea el evento
    const userResult = await query('SELECT company_id FROM users WHERE id = $1', [created_by]);
    const company_id = userResult.rows[0]?.company_id || null;

    // Generar slug único
    const slug = await generateUniqueSlug(name, async (testSlug) => {
      const existingEvent = await query(
        'SELECT id FROM events WHERE slug = $1',
        [testSlug]
      );
      return existingEvent.rows.length > 0;
    });

    const result = await query(
      `INSERT INTO events (name, slug, description, category, event_date, location, image_url, status, created_by, company_id, is_informative)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
       RETURNING *`,
      [name, slug, description || null, category || 'Todos', event_date, location || null, image_url || null, eventStatus, created_by, company_id, is_informative || false]
    );

    return NextResponse.json(result.rows[0], { status: 201 });

  } catch (error: any) {
    console.error('Error creating event:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
