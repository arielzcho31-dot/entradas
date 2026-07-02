// src/lib/auth-utils.ts
// Utilidades de autenticación segura

import { jwtVerify, SignJWT } from 'jose';
import { cookies } from 'next/headers';

const SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'dev-secret-key');
const REFRESH_SECRET = new TextEncoder().encode(process.env.REFRESH_TOKEN_SECRET || 'dev-refresh-secret');

export interface TokenPayload {
  userId: string;
  email: string;
  role: string;
  iat: number;
}

export interface RefreshTokenPayload {
  userId: string;
  iat: number;
}

/**
 * Crear token JWT (15 minutos)
 */
export async function createToken(userId: string, email: string, role: string): Promise<string> {
  const token = await new SignJWT({ userId, email, role })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('15m')
    .sign(SECRET);
  
  return token;
}

/**
 * Crear refresh token (7 días)
 */
export async function createRefreshToken(userId: string): Promise<string> {
  const token = await new SignJWT({ userId })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(REFRESH_SECRET);
  
  return token;
}

/**
 * Verificar token JWT
 */
export async function verifyToken(token: string): Promise<TokenPayload | null> {
  try {
    const verified = await jwtVerify(token, SECRET);
    return verified.payload as TokenPayload;
  } catch (error) {
    console.error('Token verification failed:', error);
    return null;
  }
}

/**
 * Verificar refresh token
 */
export async function verifyRefreshToken(token: string): Promise<RefreshTokenPayload | null> {
  try {
    const verified = await jwtVerify(token, REFRESH_SECRET);
    return verified.payload as RefreshTokenPayload;
  } catch (error) {
    console.error('Refresh token verification failed:', error);
    return null;
  }
}

/**
 * Obtener token del request (desde httpOnly cookie)
 */
export async function getTokenFromRequest(req: Request): Promise<string | null> {
  try {
    const cookieHeader = req.headers.get('cookie');
    if (!cookieHeader) return null;
    
    const cookies = cookieHeader.split(';').map(c => c.trim());
    const tokenCookie = cookies.find(c => c.startsWith('token='));
    
    if (!tokenCookie) return null;
    
    return tokenCookie.substring('token='.length);
  } catch (error) {
    return null;
  }
}

/**
 * Verificar autenticación en API routes
 */
export async function verifyAuthFromRequest(req: Request): Promise<TokenPayload | null> {
  const token = await getTokenFromRequest(req);
  if (!token) return null;
  
  return verifyToken(token);
}

/**
 * Setear tokens en cookies (httpOnly, secure)
 */
export function setTokenCookies(response: Response, token: string, refreshToken: string): Response {
  const isProduction = process.env.NODE_ENV === 'production';
  
  // Token access (15 minutos)
  response.headers.append('Set-Cookie', `token=${token}; Path=/; HttpOnly; SameSite=Strict; ${isProduction ? 'Secure;' : ''} Max-Age=900`);
  
  // Refresh token (7 días)
  response.headers.append('Set-Cookie', `refreshToken=${refreshToken}; Path=/api/auth/refresh; HttpOnly; SameSite=Strict; ${isProduction ? 'Secure;' : ''} Max-Age=604800`);
  
  return response;
}

/**
 * Limpiar cookies al logout
 */
export function clearTokenCookies(response: Response): Response {
  response.headers.append('Set-Cookie', 'token=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0');
  response.headers.append('Set-Cookie', 'refreshToken=; Path=/api/auth/refresh; HttpOnly; SameSite=Strict; Max-Age=0');
  return response;
}
