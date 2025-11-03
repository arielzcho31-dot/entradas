/**
 * Script de verificación de configuración
 * Ejecutar: node scripts/verify-setup.js
 */

import { testConnection } from '../src/lib/db.js';
import { config } from 'dotenv';

// Cargar variables de entorno
config({ path: '.env.local' });

console.log('🔍 Verificando configuración de TicketWise...\n');

// Verificar variables de entorno
const requiredEnvVars = [
  'DATABASE_HOST',
  'DATABASE_PORT',
  'DATABASE_NAME',
  'DATABASE_USER',
  'DATABASE_PASSWORD',
  'JWT_SECRET'
];

let envCheck = true;
console.log('📋 Variables de entorno:');
for (const envVar of requiredEnvVars) {
  const value = process.env[envVar];
  if (!value) {
    console.log(`   ❌ ${envVar}: No configurada`);
    envCheck = false;
  } else {
    // Ocultar passwords
    const display = envVar.includes('PASSWORD') || envVar.includes('SECRET')
      ? '***'
      : value;
    console.log(`   ✅ ${envVar}: ${display}`);
  }
}

if (!envCheck) {
  console.log('\n⚠️  Faltan variables de entorno. Crea un archivo .env.local\n');
  process.exit(1);
}

console.log('\n🔌 Probando conexión a PostgreSQL...');
const dbConnected = await testConnection();

if (!dbConnected) {
  console.log('\n❌ No se pudo conectar a PostgreSQL');
  console.log('   Verifica que:');
  console.log('   1. PostgreSQL esté corriendo');
  console.log('   2. La base de datos "ticketwase2" exista');
  console.log('   3. Las credenciales sean correctas\n');
  process.exit(1);
}

console.log('\n✅ Configuración correcta! Todo listo para ejecutar:\n');
console.log('   npm run dev\n');
