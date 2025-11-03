/**
 * Script para crear el esquema PostgreSQL desde Node.js
 * Ejecutar: node scripts/setup-database.js
 */

import pg from 'pg';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Leer variables de entorno
import { config } from 'dotenv';
config({ path: join(__dirname, '..', '.env.local') });

const dbConfig = {
  host: process.env.DATABASE_HOST || 'localhost',
  port: parseInt(process.env.DATABASE_PORT || '5432'),
  database: process.env.DATABASE_NAME || 'ticketwase2',
  user: process.env.DATABASE_USER || 'postgres',
  password: process.env.DATABASE_PASSWORD || '',
};

console.log('🔧 Configurando base de datos PostgreSQL...\n');
console.log('📍 Conexión:');
console.log(`   Host: ${dbConfig.host}`);
console.log(`   Puerto: ${dbConfig.port}`);
console.log(`   Base de datos: ${dbConfig.database}`);
console.log(`   Usuario: ${dbConfig.user}`);
console.log('');

async function setupDatabase() {
  const client = new pg.Client(dbConfig);

  try {
    console.log('🔌 Conectando a PostgreSQL...');
    await client.connect();
    console.log('✅ Conectado\n');

    // Leer el archivo SQL
    const sqlPath = join(__dirname, '..', 'docs', 'schema-postgresql.sql');
    console.log(`📄 Leyendo schema desde: ${sqlPath}`);
    const sql = readFileSync(sqlPath, 'utf-8');
    console.log('✅ Archivo leído\n');

    console.log('🗄️  Ejecutando script SQL...');
    console.log('   (Esto puede tomar unos segundos)\n');
    
    // Ejecutar el SQL
    await client.query(sql);
    
    console.log('✅ Script ejecutado exitosamente!\n');

    // Verificar tablas creadas
    console.log('📊 Verificando tablas creadas:');
    const result = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);

    result.rows.forEach(row => {
      console.log(`   ✓ ${row.table_name}`);
    });

    console.log('');

    // Verificar datos de ejemplo
    console.log('📈 Verificando datos de ejemplo:');
    const counts = await client.query(`
      SELECT 
        (SELECT COUNT(*) FROM users) as users,
        (SELECT COUNT(*) FROM events) as events,
        (SELECT COUNT(*) FROM ticket_types) as ticket_types,
        (SELECT COUNT(*) FROM orders) as orders,
        (SELECT COUNT(*) FROM tickets) as tickets
    `);

    const data = counts.rows[0];
    console.log(`   👥 Usuarios: ${data.users}`);
    console.log(`   🎪 Eventos: ${data.events}`);
    console.log(`   🎟️  Tipos de entrada: ${data.ticket_types}`);
    console.log(`   📦 Órdenes: ${data.orders}`);
    console.log(`   🎫 Tickets: ${data.tickets}`);

    console.log('\n' + '='.repeat(50));
    console.log('🎉 ¡Base de datos configurada exitosamente!');
    console.log('='.repeat(50) + '\n');

    console.log('📝 Credenciales de prueba:');
    console.log('   Email: admin@ticketwise.com');
    console.log('   Password: Admin123!\n');

    console.log('🚀 Siguiente paso:');
    console.log('   npm run dev\n');

  } catch (error) {
    console.error('\n❌ Error al configurar la base de datos:\n');
    
    if (error.code === 'ECONNREFUSED') {
      console.error('💡 PostgreSQL no está corriendo o no es accesible.');
      console.error('   Verifica que PostgreSQL esté instalado y corriendo.\n');
      console.error('   Windows: Abre "Servicios" y busca "postgresql"');
      console.error('   O ejecuta: net start postgresql-x64-16\n');
    } else if (error.code === '3D000') {
      console.error('💡 La base de datos no existe.');
      console.error('   Crea la base de datos primero:\n');
      console.error('   1. Abre pgAdmin o SQL Shell (psql)');
      console.error('   2. Ejecuta: CREATE DATABASE ticketwase2;\n');
    } else if (error.code === '28P01') {
      console.error('💡 Password incorrecto.');
      console.error('   Verifica DATABASE_PASSWORD en .env.local\n');
    } else {
      console.error(error.message);
      console.error('\nDetalles del error:');
      console.error(error);
    }
    
    process.exit(1);
  } finally {
    await client.end();
  }
}

// Ejecutar
setupDatabase();
