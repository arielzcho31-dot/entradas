import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://dpgixsgabjvffuwrnhim.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRwZ2l4c2dhYmp2ZmZ1d3JuaGltIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk2ODczOTcsImV4cCI6MjA3NTI2MzM5N30.DlVOnxDnRWdAnWpVfTPno1bPT0srj0WMxPYxkH6UDsE';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Archivo eliminado: este archivo era un duplicado y no debe usarse. Usa src/lib/supabaseClient.ts en su lugar.
