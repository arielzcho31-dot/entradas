/**
 * Script para agregar columna slug a la tabla events
 * Ejecutar con: node scripts/add-slug-column.js
 */

import pg from 'pg';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const { Pool } = pg;
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Cargar .env.local desde la raíz del proyecto
dotenv.config({ path: join(__dirname, '..', '.env.local') });

async function addSlugColumn() {
  // Crear conexión a PostgreSQL (usando las mismas variables que src/lib/db.ts)
  const pool = new Pool({
    host: process.env.DATABASE_HOST || 'localhost',
    port: parseInt(process.env.DATABASE_PORT || '5432'),
    database: process.env.DATABASE_NAME || 'ticketwase2',
    user: process.env.DATABASE_USER || 'postgres',
    password: process.env.DATABASE_PASSWORD || '',
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
  });

  try {
    console.log('🔄 Conectando a la base de datos...');
    
    const client = await pool.connect();
    console.log('✅ Conectado exitosamente\n');

    // 1. Agregar columna slug
    console.log('📝 Agregando columna slug...');
    await client.query(`
      ALTER TABLE events ADD COLUMN IF NOT EXISTS slug VARCHAR(150) UNIQUE;
    `);
    console.log('✅ Columna slug agregada\n');

    // 2. Crear índice
    console.log('📝 Creando índice para búsquedas rápidas...');
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_events_slug ON events(slug);
    `);
    console.log('✅ Índice creado\n');

    // 3. Obtener eventos sin slug
    console.log('📝 Buscando eventos existentes sin slug...');
    const eventsResult = await client.query(`
      SELECT id, name FROM events WHERE slug IS NULL
    `);
    
    const events = eventsResult.rows;
    console.log(`📊 Encontrados ${events.length} eventos sin slug\n`);

    if (events.length === 0) {
      console.log('✅ Todos los eventos ya tienen slug');
      client.release();
      await pool.end();
      return;
    }

    // 4. Generar slug para cada evento
    console.log('🔄 Generando slugs...\n');
    
    for (const event of events) {
      // Generar slug base
      let baseSlug = event.name
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // Remover acentos
        .replace(/[^a-z0-9]+/g, '-')      // Reemplazar caracteres especiales con guiones
        .replace(/^-+|-+$/g, '')          // Remover guiones al inicio y final
        .substring(0, 100);               // Limitar a 100 caracteres

      // Asegurar unicidad
      let slug = baseSlug;
      let counter = 1;

      while (true) {
        const existing = await client.query(
          'SELECT id FROM events WHERE slug = $1 AND id != $2',
          [slug, event.id]
        );

        if (existing.rows.length === 0) {
          break; // Slug único encontrado
        }

        slug = `${baseSlug}-${counter}`;
        counter++;
      }

      // Actualizar evento con slug
      await client.query(
        'UPDATE events SET slug = $1 WHERE id = $2',
        [slug, event.id]
      );

      console.log(`  ✓ "${event.name}" → "${slug}"`);
    }

    console.log('\n✅ Todos los slugs generados exitosamente!');
    console.log('\n📋 Resumen:');
    console.log(`   - Columna slug: ✅ Creada`);
    console.log(`   - Índice: ✅ Creado`);
    console.log(`   - Eventos actualizados: ${events.length}`);

    client.release();
    await pool.end();
    console.log('\n🎉 Script completado exitosamente!');
    
  } catch (error) {
    console.error('\n❌ Error ejecutando el script:', error.message);
    console.error('\nDetalles del error:', error);
    process.exit(1);
  }
}

// Ejecutar
addSlugColumn();
