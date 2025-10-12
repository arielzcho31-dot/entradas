// src/lib/test-db.ts
import { dbConnect, User, Entrada } from './mongodb.js';

async function main() {
  try {
    // Conectar a MongoDB
    await dbConnect();

    // ✅ Probar User
    const users = await User.find({}).limit(3);
    console.log('\nUsuarios encontrados en la DB:', users);

    // ✅ Probar Entrada
    const entradas = await Entrada.find({}).limit(3);
    console.log('\nEntradas encontradas en la DB:', entradas);

    // Opcional: crear un user de prueba si no existe
    if (users.length === 0) {
      const nuevoUser = new User({
        _id: 'test123',
        ci: '1234567',
        displayName: 'Usuario de Prueba',
        email: 'test@example.com',
        numero: '099123456',
        role: 'cliente',
        universidad: 'UNA',
        usuario: 'testuser',
        password: 'hashed_password',
      });

      await nuevoUser.save();
      console.log('\n✅ Usuario de prueba creado!');
    }
  } catch (error) {
    console.error('❌ Error en test-db:', error);
  } finally {
    process.exit(0); // Cierra el proceso
  }
}

main();
