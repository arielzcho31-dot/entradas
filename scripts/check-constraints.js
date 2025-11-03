import pg from 'pg';
const { Client } = pg;

const client = new Client({
  host: 'localhost',
  port: 5432,
  database: 'ticketwase2',
  user: 'postgres',
  password: '124783',
});

async function checkConstraints() {
  try {
    await client.connect();
    console.log('✓ Conectado a PostgreSQL');

    // Verificar constraints
    const constraints = await client.query(`
      SELECT
        con.conname as constraint_name,
        con.contype as constraint_type,
        CASE 
          WHEN con.contype = 'p' THEN 'PRIMARY KEY'
          WHEN con.contype = 'f' THEN 'FOREIGN KEY'
          WHEN con.contype = 'u' THEN 'UNIQUE'
          WHEN con.contype = 'c' THEN 'CHECK'
        END as type_description
      FROM pg_constraint con
      JOIN pg_class rel ON rel.oid = con.conrelid
      WHERE rel.relname = 'event_organizers';
    `);
    
    console.log('\nConstraints:');
    constraints.rows.forEach(c => {
      console.log(`- ${c.constraint_name}: ${c.type_description}`);
    });

    // Verificar índices
    const indexes = await client.query(`
      SELECT indexname, indexdef
      FROM pg_indexes
      WHERE tablename = 'event_organizers';
    `);
    
    console.log('\nÍndices:');
    indexes.rows.forEach(idx => {
      console.log(`- ${idx.indexname}`);
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.end();
  }
}

checkConstraints();
