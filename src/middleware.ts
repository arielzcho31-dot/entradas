import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth-utils';

// MODO HÍBRIDO: Security headers activos, rate limiting deshabilitado
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Skip middleware para archivos estáticos
  if (
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/static/') ||
    pathname.startsWith('/favicon.ico') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  // Response con security headers básicos
  const response = NextResponse.next();
  
  // SECURITY HEADERS - Siempre activos para protección
  response.headers.set('X-Frame-Options', 'SAMEORIGIN');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  
  // Content Security Policy básico
  response.headers.set(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self' https:;"
  );

  // CORS headers para APIs
  if (pathname.startsWith('/api/')) {
    response.headers.set('Access-Control-Allow-Origin', '*');
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  }

  // Logging para debugging (solo en desarrollo)
  if (process.env.NODE_ENV === 'development') {
    console.log(`🔒 [HÍBRIDO] ${request.method} ${pathname}`);
  }

  // Rutas públicas (sin protección)
  const PUBLIC_ROUTES = [
    '/',
    '/login',
    '/signup',
    '/events',
    '/home-events',
    '/api/auth/login',
    '/api/auth/register',
    '/api/events',
    '/api/health',
  ];

  // Rutas protegidas que requieren autenticación
  const PROTECTED_ROUTES = [
    '/dashboard',
    '/api/protected',
    '/api/orders',
    '/api/tickets',
    '/api/users',
  ];

  // Rutas solo para admin
  const ADMIN_ROUTES = [
    '/api/admin',
    '/dashboard/admin',
    '/dashboard/users',
  ];

  // Rutas solo para validador
  const VALIDATOR_ROUTES = [
    '/dashboard/validator',
    '/dashboard/scan',
  ];

  // Rutas públicas - permitir siempre
  if (PUBLIC_ROUTES.some(route => pathname === route || pathname.startsWith(route + '/'))) {
    return NextResponse.next();
  }

  // Obtener token de cookies
  const token = request.cookies.get('token')?.value;

  // Rutas protegidas
  if (PROTECTED_ROUTES.some(route => pathname.startsWith(route))) {
    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    // Verificar token
    const payload = await verifyToken(token);
    if (!payload) {
      // Token inválido - intentar refresh
      const refreshToken = request.cookies.get('refreshToken')?.value;
      if (!refreshToken) {
        return NextResponse.redirect(new URL('/login', request.url));
      }
      // Aquí podría haber lógica para renovar el token
      return NextResponse.redirect(new URL('/login', request.url));
    }

    // Verificar rutas por rol
    if (ADMIN_ROUTES.some(route => pathname.startsWith(route))) {
      if (payload.role !== 'admin' && payload.role !== 'organizer') {
        return NextResponse.redirect(new URL('/dashboard', request.url));
      }
    }

    if (VALIDATOR_ROUTES.some(route => pathname.startsWith(route))) {
      if (payload.role !== 'validator' && payload.role !== 'admin') {
        return NextResponse.redirect(new URL('/dashboard', request.url));
      }
    }

    // Continuar
    response.headers.set('X-User-Id', payload.userId);
    response.headers.set('X-User-Role', payload.role);
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
};