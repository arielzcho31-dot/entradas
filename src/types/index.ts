// Tipo de usuario autenticado con PostgreSQL
export interface AuthUser {
  id: string;
  email: string;
  role: string;
  display_name?: string;
  ci?: string;
  usuario?: string;
  numero?: string;
  universidad?: string;
  user_metadata?: {
    displayName?: string;
    role?: string;
  };
}
