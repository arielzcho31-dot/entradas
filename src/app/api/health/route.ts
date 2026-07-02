import { NextRequest } from 'next/server';
import db from '@/lib/database';

export async function GET(req: NextRequest) {
  try {
    // Intentar conexión a BD
    console.log('🏥 Health check started...');
    
    const result = await db.query('SELECT NOW() as timestamp, version() as version');
    
    return Response.json({
      status: 'ok',
      database: 'connected',
      timestamp: result.rows[0].timestamp,
      version: result.rows[0].version,
      environment: {
        host: process.env.DATABASE_HOST,
        port: process.env.DATABASE_PORT,
        database: process.env.DATABASE_NAME,
        user: process.env.DATABASE_USER,
      }
    });
  } catch (error: any) {
    console.error('❌ Health check error:', error);
    return Response.json({
      status: 'error',
      database: 'disconnected',
      error: error.message,
      environment: {
        host: process.env.DATABASE_HOST,
        port: process.env.DATABASE_PORT,
        database: process.env.DATABASE_NAME,
        user: process.env.DATABASE_USER,
      }
    }, { status: 503 });
  }
}

// Endpoint para listar usuarios (para debug)
export async function POST(req: NextRequest) {
  try {
    const { action } = await req.json();
    
    if (action === 'list-users') {
      const result = await db.query(
        'SELECT id, email, role, display_name, created_at FROM users LIMIT 10'
      );
      return Response.json({
        count: result.rows.length,
        users: result.rows
      });
    }
    
    if (action === 'find-user') {
      const { email } = await req.json();
      const result = await db.query(
        'SELECT id, email, role, display_name, password FROM users WHERE LOWER(email) = LOWER($1)',
        [email]
      );
      
      return Response.json({
        found: result.rows.length > 0,
        user: result.rows[0] || null,
        hasPassword: result.rows[0]?.password ? true : false
      });
    }
    
    return Response.json({ error: 'Unknown action' }, { status: 400 });
  } catch (error: any) {
    console.error('❌ Debug endpoint error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}
