// Requiere: npm install @supabase/supabase-js bcrypt
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcrypt';

// Para __dirname en ES modules:
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configura tus credenciales de Supabase
const SUPABASE_URL = 'https://dpgixsgabjvffuwrnhim.supabase.co'; // <-- Cambia esto
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRwZ2l4c2dhYmp2ZmZ1d3JuaGltIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk2ODczOTcsImV4cCI6MjA3NTI2MzM5N30.DlVOnxDnRWdAnWpVfTPno1bPT0srj0WMxPYxkH6UDsE'; // <-- Cambia esto

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Lee el archivo exportado de Firebase
const data = JSON.parse(
  fs.readFileSync(path.join(__dirname, 'firebase-export.json'), 'utf8')
);

async function migrateUsers() {
  const users = data.users.map(u => {
    // Elimina campos innecesarios
    const { _ref, ...rest } = u;
    return rest;
  });

  for (const user of users) {
    const { error } = await supabase.from('users').insert([user]);
    if (error) {
      console.error('Error insertando usuario:', user.id, error.message);
    } else {
      console.log('Usuario insertado:', user.id);
    }
  }
}

async function migrateOrders() {
  const orders = data.orders.map(o => {
    // Elimina campos innecesarios
    const { _ref, ...rest } = o;
    return rest;
  });

  for (const order of orders) {
    const { error } = await supabase.from('orders').insert([order]);
    if (error) {
      console.error('Error insertando orden:', order.id, error.message);
    } else {
      console.log('Orden insertada:', order.id);
    }
  }
}

// ADVERTENCIA: Asegúrate de que los campos 'id' en las tablas 'users' y 'orders' sean de tipo 'text' y no 'bigint'.
// Si ya tienes datos, puedes cambiar el tipo de columna en Supabase con una migración SQL:
// ALTER TABLE users ALTER COLUMN id TYPE text;
// ALTER TABLE orders ALTER COLUMN id TYPE text;

async function updateAllUserPasswords(newPassword) {
  // Hashea la nueva contraseña
  const hashedPassword = await bcrypt.hash(newPassword, 10);

  // Obtiene todos los usuarios
  const { data: users, error } = await supabase.from('users').select('id');
  if (error) {
    console.error('Error obteniendo usuarios:', error.message);
    return;
  }
  for (const user of users) {
    const { error: updateError } = await supabase
      .from('users')
      .update({ password: hashedPassword }) // Usa la contraseña hasheada
      .eq('id', user.id);
    if (updateError) {
      console.error('Error actualizando usuario:', user.id, updateError.message);
    } else {
      console.log('Contraseña actualizada para usuario:', user.id);
    }
  }
}

async function main() {
  // Migrar solo usuarios:
  //await migrateUsers();
  // Cuando los usuarios estén migrados correctamente, comenta la línea anterior y descomenta la siguiente para migrar órdenes:
  //await migrateOrders();

  // Actualiza la contraseña de todos los usuarios:
  //await updateAllUserPasswords('Ariel432;');
  console.log('Contraseñas actualizadas a versión encriptada.');
}

main();
