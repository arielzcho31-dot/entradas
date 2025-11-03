import pg from 'pg';
const { Client } = pg;

const client = new Client({
  host: 'localhost',
  port: 5432,
  database: 'ticketwase2',
  user: 'postgres',
  password: '124783',
});

async function checkTable() {
  try {
    await client.connect();
    console.log('✓ Conectado a PostgreSQL');

    // Verificar si la tabla existe
    const tableExists = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'event_organizers'
      );
    `);
    
    console.log('\nTabla event_organizers existe:', tableExists.rows[0].exists);

    if (tableExists.rows[0].exists) {
      // Listar columnas
      const columns = await client.query(`
        SELECT column_name, data_type, column_default
        FROM information_schema.columns
        WHERE table_name = 'event_organizers'
        ORDER BY ordinal_position;
      `);
      
      console.log('\nColumnas actuales:');
      columns.rows.forEach(col => {
        console.log(`- ${col.column_name} (${col.data_type})`);
      });
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.end();
  }
}

checkTable();
