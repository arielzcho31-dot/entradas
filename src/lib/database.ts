// audit
import { Pool, QueryResult, PoolClient } from 'pg';

// Crear pool de conexiones
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

// Función query
const query = async (text: string, params?: any[]): Promise<QueryResult> => {
  const start = Date.now();
  try {
    const result = await pool.query(text, params);
    const duration = Date.now() - start;
    if (duration > 1000) {
      console.warn(`Query took ${duration}ms:`, text.substring(0, 50));
    }
    return result;
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
};

// Función connect para transacciones
const connect = async (): Promise<PoolClient> => {
  try {
    const client = await pool.connect();
    return client;
  } catch (error) {
    console.error('Database connection error:', error);
    throw error;
  }
};

// Exportar
export const db = {
  query,
  connect,
};

export { pool };

// Health check
pool.on('error', (err) => {
  console.error('Unexpected pool error:', err);
});

pool.on('connect', () => {
  console.log('✅ PostgreSQL connected at', process.env.DATABASE_HOST);
});

export default db;