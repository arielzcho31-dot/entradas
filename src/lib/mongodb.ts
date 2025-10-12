/*/ src/lib/import-mongodb.ts
import fs from 'fs';
import mongoose from 'mongoose';  // Importación agregada para ObjectId
import { dbConnect } from './mongodb';
import { User, Entrada } from './mongodb';  // Asegúrate de que estén exportados en mongodb.ts
import bcrypt from 'bcryptjs';
import path from 'path';  // Opcional: para paths absolutos

async function importData() {
  try {
    await dbConnect();
    console.log('Conectado a MongoDB. Iniciando import...');

    // Verifica si el archivo existe
    const filePath = path.join(process.cwd(), 'firebase-export.json');  // Usa path absoluto para robustez
    if (!fs.existsSync(filePath)) {
      throw new Error(`Archivo no encontrado: ${filePath}. Asegúrate de que firebase-export.json esté en la raíz del proyecto.`);
    }

    const rawData = fs.readFileSync(filePath, 'utf8');
    const data: any = JSON.parse(rawData);  // Tipado any para JSON genérico; ajusta si tienes un schema

    // Import users (primero, para refs en orders)
    console.log('\n--- Importando users ---');
    let importedUsers = 0;
    for (const userDoc of data.users || []) {
      try {
        const mappedUser  = {
          _id: userDoc.id,  // Asume que id es ObjectId válido o string
          ci: userDoc.ci,
          createdAt: new Date(userDoc.createdAt),  // Ajusta si es timestamp de Firebase
          displayName: userDoc.displayName,
          email: userDoc.email,
          numero: userDoc.numero,
          role: userDoc.role === 'customer' ? 'cliente' : userDoc.role,  // Mapeo
          universidad: userDoc.universidad,
          usuario: userDoc.usuario,
          password: await bcrypt.hash('default_password_123', 10),  // Hashed default; cámbialo después
        };

        const result = await User.findByIdAndUpdate(
          userDoc.id,
          mappedUser ,
          { upsert: true, new: true }
        );
        console.log(`  - User importado/actualizado: ${userDoc.email} (rol: ${mappedUser .role})`);  // Corregido: sin espacio extra
        importedUsers++;
      } catch (err) {
        console.error(`  - Error importando user ${userDoc.email}:`, err);
      }
    }

    // Import orders (Entradas)
    console.log('\n--- Importando orders (Entradas) ---');
    let importedOrders = 0;
    for (const orderDoc of data.orders || []) {
      try {
        // Convierte userId string a ObjectId (asumiendo que existe en users)
        // Nota: Si userId es UID de Firebase y no coincide con _id de User, ajusta el mapeo
        const userIdObj = new mongoose.Types.ObjectId(orderDoc.userId);

        const mappedOrder = {
          _id: orderDoc.id,
          createdAt: new Date(orderDoc.createdAt),
          quantity: orderDoc.quantity,
          comprobanteUrl: orderDoc.receiptUrl,
          estado: orderDoc.status === 'verified' ? 'enable' : (orderDoc.status === 'pending' ? 'disable' : 'disable'),  // Mapeo
          codigoQR: orderDoc.ticketId,
          nombreEntrada: orderDoc.ticketName,
          precioTotal: orderDoc.totalPrice,
          userId: userIdObj,
          userEmail: orderDoc.userEmail,
          userName: orderDoc.userName,
        };

        const result = await Entrada.findByIdAndUpdate(
          orderDoc.id,
          mappedOrder,
          { upsert: true, new: true }
        );
        console.log(`  - Entrada importada/actualizada: ${orderDoc.ticketId} (estado: ${mappedOrder.estado}, user: ${orderDoc.userName})`);
        importedOrders++;
      } catch (err) {
        console.error(`  - Error importando order ${orderDoc.id}:`, err);
      }
    }

    console.log('\n✅ ¡Import completado! Verifica en MongoDB Atlas > Collections.');
    console.log(`- Users importados: ${importedUsers}`);
    console.log(`- Entradas importadas: ${importedOrders}`);

    // Opcional: Lista todos los users post-import (solo los primeros 5 para no saturar logs)
    const allUsers = await User.find({}).limit(5);
    console.log(`\nEjemplo de users en DB:`, allUsers.map(u => ({ email: u.email, role: u.role })));

  } catch (error) {
    console.error('Error durante el import:', error);
    process.exit(1);  // Sale con error si falla
  } finally {
    // Opcional: Desconectar de MongoDB
    // await mongoose.connection.close();
    process.exit(0);
  }
}

// Ejecuta el script
importData();
*/
// src/lib/mongodb.ts
import mongoose, { Schema, model, models, Model, Document } from 'mongoose';

// -------------------
// Conexión a MongoDB
// -------------------
export async function dbConnect() {
  if (mongoose.connection.readyState >= 1) return;

  return mongoose.connect(process.env.MONGODB_URI as string, {
    dbName: 'mi_basedatos', // cámbialo al nombre de tu base de datos en Atlas
  });
}

// -------------------
// Interfaces (tipos TS)
// -------------------
export interface IUser extends Document {
  ci: string;
  createdAt: Date;
  displayName: string;
  email: string;
  numero: string;
  role: string;
  universidad: string;
  usuario: string;
  password: string;
}

export interface IEntrada extends Document {
  createdAt: Date;
  quantity: number;
  comprobanteUrl: string;
  estado: string;
  codigoQR: string;
  nombreEntrada: string;
  precioTotal: number;
  userId: mongoose.Types.ObjectId;
  userEmail: string;
  userName: string;
}

// -------------------
// Schemas y Modelos
// -------------------

// User
const userSchema = new Schema<IUser>({
  ci: { type: String },
  createdAt: { type: Date, default: Date.now },
  displayName: { type: String },
  email: { type: String, required: true, unique: true },
  numero: { type: String },
  role: { type: String, default: 'cliente' },
  universidad: { type: String },
  usuario: { type: String },
  password: { type: String, required: true },
});

export const User: Model<IUser> = models.User || model<IUser>('User', userSchema);

// Entrada (Orders)
const entradaSchema = new Schema<IEntrada>({
  createdAt: { type: Date, default: Date.now },
  quantity: { type: Number },
  comprobanteUrl: { type: String },
  estado: { type: String, default: 'disable' },
  codigoQR: { type: String },
  nombreEntrada: { type: String },
  precioTotal: { type: Number },
  userId: { type: Schema.Types.ObjectId, ref: 'User' },
  userEmail: { type: String },
  userName: { type: String },
});

export const Entrada: Model<IEntrada> =
  models.Entrada || model<IEntrada>('Entrada', entradaSchema);
