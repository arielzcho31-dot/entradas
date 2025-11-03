import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Verificar que el servidor esté funcionando
    return NextResponse.json({ 
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    });
  } catch (error) {
    return NextResponse.json({ 
      status: 'error',
      message: 'Server is not healthy'
    }, { status: 503 });
  }
}
