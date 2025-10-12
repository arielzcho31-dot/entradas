import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

// Crea un cliente de Supabase para el lado del cliente (frontend).
// Este cliente está diseñado para funcionar en componentes de React y
// manejar la sesión de forma automática entre el cliente y el servidor.
export const supabase = createClientComponentClient();
