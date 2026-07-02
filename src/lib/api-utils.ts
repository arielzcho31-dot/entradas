// src/lib/api-utils.ts
// Utilidades estándar para respuestas API

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export function apiSuccess<T>(data: T, statusCode = 200): Response {
  return Response.json({ success: true, data }, { status: statusCode });
}

export function apiError(message: string, statusCode = 400): Response {
  console.error(`[API Error ${statusCode}]: ${message}`);
  return Response.json({ success: false, error: message }, { status: statusCode });
}

export function apiErrorWithDetails(message: string, details?: any, statusCode = 400): Response {
  console.error(`[API Error ${statusCode}]:`, { message, details });
  // En producción, no devolver detalles técnicos
  const errorMessage = process.env.NODE_ENV === 'production' ? message : `${message} ${JSON.stringify(details)}`;
  return Response.json({ success: false, error: errorMessage }, { status: statusCode });
}
