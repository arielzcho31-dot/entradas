// Script para limpiar todas las tablas de la base de datos Supabase
// Uso: node reset-data.js

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function resetTables() {
  // Lista de todas las tablas conocidas del proyecto
  const tables = [
    'tickets',
    'orders',
    'users',
    'entradas',
    'recent_sales',
    'dashboard_stats',
    'events',
    'generated_tickets',
    'roles',
    'profiles',
    // Agrega aquí cualquier otra tabla personalizada que tengas
  ];
  for (const table of tables) {
    const { error } = await supabase.from(table).delete().neq('id', '');
    if (error) {
      console.error(`Error al limpiar la tabla ${table}:`, error.message);
    } else {
      console.log(`Tabla ${table} limpiada correctamente.`);
    }
  }
  process.exit(0);
}

resetTables();
