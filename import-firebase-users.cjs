// Script para importar usuarios de firebase-export.json a MongoDB
// Guarda este archivo como import-firebase-users.js y ejecútalo con: node import-firebase-users.js

const fs = require('fs');
const { MongoClient } = require('mongodb');

const MONGO_URI = 'mongodb://atlas-sql-68e1d08f38bfb3021cfb8a28-ridedz.a.query.mongodb.net/sample_mflix?ssl=true&authSource=admin'; // Cambia si usas Atlas o diferente host
const DB_NAME = 'sample_mflix'; // Cambia por el nombre real de tu base de datos
const USERS_COLLECTION = 'users';

async function main() {
  // Leer el archivo de exportación
  const data = JSON.parse(fs.readFileSync('./firebase-export.json', 'utf8'));
  const users = data.users || [];
  if (!users.length) {
    console.error('No se encontraron usuarios en firebase-export.json');
    return;
  }

  // Conectar a MongoDB
  const client = new MongoClient(MONGO_URI);
  await client.connect();
  const db = client.db(DB_NAME);
  const collection = db.collection(USERS_COLLECTION);

  // Preparar usuarios (ajustar campos si es necesario)
  const usersToInsert = users.map(u => ({
    displayName: u.displayName,
    email: u.email,
    role: u.role,
    ci: u.ci,
    numero: u.numero,
    usuario: u.usuario,
    universidad: u.universidad,
    createdAt: u.createdAt,
    // Puedes agregar más campos si tu modelo de MongoDB lo requiere
  }));

  // Insertar usuarios (ignorar duplicados por email)
  for (const user of usersToInsert) {
    const exists = await collection.findOne({ email: user.email });
    if (!exists) {
      await collection.insertOne(user);
      console.log(`Usuario importado: ${user.email}`);
    } else {
      console.log(`Ya existe: ${user.email}`);
    }
  }

  await client.close();
  console.log('Importación finalizada.');
}

main().catch(err => {
  console.error('Error al importar usuarios:', err);
});
