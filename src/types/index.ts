import { User } from '@supabase/supabase-js';

// Extendemos el tipo 'User' de Supabase para incluir nuestra propiedad 'role'.
export interface AuthUser extends User {
  role: string;
}
