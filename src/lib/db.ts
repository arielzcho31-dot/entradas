/**
 * Cliente PostgreSQL para TicketWise
 * Maneja la conexión a la base de datos ticketwase2
 */

import { Pool, PoolClient, QueryResult, QueryResultRow } from 'pg';

// Configuración del pool de conexiones
const pool = new Pool({
  host: process.env.DATABASE_HOST || 'localhost',
  port: parseInt(process.env.DATABASE_PORT || '5432'),
  database: process.env.DATABASE_NAME || 'ticketwase2',
  user: process.env.DATABASE_USER || 'postgres',
  password: process.env.DATABASE_PASSWORD || '',
  max: 20, // Máximo de conexiones en el pool
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Manejo de errores del pool
pool.on('error', (err) => {
  console.error('Error inesperado en el cliente PostgreSQL:', err);
  process.exit(-1);
});

/**
 * Ejecuta una consulta SQL
 * @param text - Consulta SQL
 * @param params - Parámetros de la consulta
 * @returns Resultado de la consulta
 */
export async function query<T extends QueryResultRow = any>(
  text: string,
  params?: any[]
): Promise<QueryResult<T>> {
  const start = Date.now();
  try {
    const result = await pool.query<T>(text, params);
    const duration = Date.now() - start;
    
    if (process.env.NODE_ENV === 'development') {
      console.log('Consulta ejecutada:', { text, duration, rows: result.rowCount });
    }
    
    return result;
  } catch (error) {
    console.error('Error en consulta SQL:', { text, params, error });
    throw error;
  }
}

/**
 * Obtiene un cliente del pool para transacciones
 * @returns Cliente PostgreSQL
 */
export async function getClient(): Promise<PoolClient> {
  const client = await pool.connect();
  return client;
}

/**
 * Ejecuta múltiples consultas en una transacción
 * @param callback - Función que contiene las consultas
 * @returns Resultado de la transacción
 */
export async function transaction<T>(
  callback: (client: PoolClient) => Promise<T>
): Promise<T> {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error en transacción:', error);
    throw error;
  } finally {
    client.release();
  }
}

/**
 * Cierra el pool de conexiones (usar solo al finalizar la aplicación)
 */
export async function closePool(): Promise<void> {
  await pool.end();
  console.log('Pool de conexiones PostgreSQL cerrado');
}

/**
 * Verifica la conexión a la base de datos
 * @returns true si la conexión es exitosa
 */
export async function testConnection(): Promise<boolean> {
  try {
    const result = await query('SELECT NOW() as now');
    console.log('✅ Conexión a PostgreSQL exitosa:', result.rows[0].now);
    return true;
  } catch (error) {
    console.error('❌ Error al conectar con PostgreSQL:', error);
    return false;
  }
}

// Exporta el pool por si se necesita acceso directo
export { pool };

// ====================================
// FUNCIONES DE UTILIDAD PARA QUERIES
// ====================================

/**
 * Helper para construir queries con paginación
 */
export interface PaginationParams {
  page?: number;
  limit?: number;
  orderBy?: string;
  orderDirection?: 'ASC' | 'DESC';
}

export function buildPaginationQuery(params: PaginationParams): string {
  const { page = 1, limit = 10, orderBy = 'created_at', orderDirection = 'DESC' } = params;
  const offset = (page - 1) * limit;
  
  return `ORDER BY ${orderBy} ${orderDirection} LIMIT ${limit} OFFSET ${offset}`;
}

/**
 * Helper para construir condiciones WHERE dinámicas
 */
export function buildWhereClause(
  conditions: Record<string, any>,
  startIndex: number = 1
): { clause: string; values: any[] } {
  const entries = Object.entries(conditions).filter(([_, value]) => value !== undefined);
  
  if (entries.length === 0) {
    return { clause: '', values: [] };
  }
  
  const clauses = entries.map(([key], index) => `${key} = $${startIndex + index}`);
  const values = entries.map(([_, value]) => value);
  
  return {
    clause: `WHERE ${clauses.join(' AND ')}`,
    values,
  };
}

/**
 * Helper para sanitizar nombres de columnas/tablas (prevenir SQL injection)
 */
export function sanitizeIdentifier(identifier: string): string {
  // Solo permite letras, números y guiones bajos
  if (!/^[a-zA-Z0-9_]+$/.test(identifier)) {
    throw new Error(`Identificador inválido: ${identifier}`);
  }
  return identifier;
}

// Test de conexión al iniciar (solo en desarrollo)
if (process.env.NODE_ENV === 'development') {
  testConnection().catch(console.error);
}
