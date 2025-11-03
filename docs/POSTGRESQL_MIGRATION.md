# 🚀 Migración a PostgreSQL - Guía Completa

## 📋 Cambios Realizados

### 1. **Nuevo Esquema de Base de Datos**
- ✅ Soporte para múltiples eventos
- ✅ Tabla `events` para gestionar eventos
- ✅ Tabla `ticket_types` para tipos de entrada por evento
- ✅ Columna `event_id` agregada a `orders` y `tickets`
- ✅ Tabla `event_organizers` para asignar roles por evento

### 2. **Archivos Eliminados**
#### Firebase Legacy:
- `src/lib/firebase.ts`
- `firebase-export.json`
- `cors.json`
- `firestore.rules`
- `studio-*-firebase-adminsdk-*.json`
- `import-firebase-users.cjs`
- `firebase-to-supabase.js`

#### Supabase:
- `src/lib/supabaseClient.ts`
- `supabaseClient.ts`
- `README-supabase.md`
- `src/scripts/set-admin-role.ts`
- `src/config/index.ts`

#### MongoDB/Otros:
- `src/lib/mongodb.ts`
- `src/lib/db-functions.ts`
- `reset-data.js`
- `users.json`, `orders.json`

### 3. **Archivos Nuevos/Actualizados**
- ✅ `docs/bdd.txt` - Esquema actualizado
- ✅ `docs/schema-postgresql.sql` - Script SQL completo
- ✅ `src/lib/db.ts` - Cliente PostgreSQL
- ✅ `.env.example` - Variables de entorno
- ✅ `package.json` - Dependencias actualizadas

---

## 🔧 Instalación y Configuración

### Paso 1: Instalar Dependencias
```bash
npm install
```

Esto instalará:
- `pg` (node-postgres) - Cliente PostgreSQL
- `@types/pg` - Tipos TypeScript

### Paso 2: Configurar Variables de Entorno
Crea un archivo `.env.local` en la raíz del proyecto:

```env
# PostgreSQL
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_NAME=ticketwase2
DATABASE_USER=postgres
DATABASE_PASSWORD=tu_password

# JWT
JWT_SECRET=tu_secreto_super_seguro

# App
NODE_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:9002
```

### Paso 3: Crear la Base de Datos
Ejecuta el script SQL para crear todas las tablas:

```bash
# Opción 1: Desde psql
psql -U postgres -d ticketwase2 -f docs/schema-postgresql.sql

# Opción 2: Desde pgAdmin
# Abre pgAdmin, conecta a tu servidor, y ejecuta docs/schema-postgresql.sql
```

### Paso 4: Verificar la Conexión
El archivo `src/lib/db.ts` incluye una función de test que se ejecuta automáticamente en desarrollo:

```bash
npm run dev
```

Deberías ver en consola:
```
✅ Conexión a PostgreSQL exitosa: 2025-11-01T...
```

---

## 📊 Esquema de Base de Datos

### Tablas Principales

#### **users**
```sql
id UUID PRIMARY KEY
email TEXT UNIQUE NOT NULL
password TEXT (bcrypt hash)
role TEXT (admin, organizer, validator, user)
display_name, ci, usuario, numero, universidad
```

#### **events** (NUEVA)
```sql
id UUID PRIMARY KEY
name TEXT NOT NULL
description, event_date, location, image_url
status TEXT (active, ended, cancelled)
created_by UUID -> users(id)
```

#### **ticket_types** (NUEVA)
```sql
id UUID PRIMARY KEY
event_id UUID -> events(id) CASCADE
name TEXT (General, VIP, Estudiante)
price INTEGER (centavos)
quantity_available INTEGER
```

#### **orders** (MODIFICADA)
```sql
id UUID PRIMARY KEY
event_id UUID -> events(id) CASCADE  ⭐ NUEVO
ticket_type_id UUID -> ticket_types(id)  ⭐ NUEVO
user_id UUID -> users(id)
quantity, total_price, receipt_url
status TEXT (pending, approved, rejected)
```

#### **tickets** (MODIFICADA)
```sql
id UUID PRIMARY KEY
event_id UUID -> events(id) CASCADE  ⭐ NUEVO
order_id UUID -> orders(id) CASCADE
user_id UUID -> users(id)
status TEXT (verified, used, cancelled)
validated_by UUID -> users(id)  ⭐ NUEVO
```

#### **event_organizers** (NUEVA)
```sql
event_id, user_id (PK compuesta)
role TEXT (organizer, validator)
```

---

## 🔄 Migración de Código

### Antes (Supabase):
```typescript
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(url, key);

const { data, error } = await supabase
  .from('users')
  .select('*')
  .eq('email', email);
```

### Ahora (PostgreSQL):
```typescript
import { query } from '@/lib/db';

const result = await query(
  'SELECT * FROM users WHERE email = $1',
  [email]
);
const users = result.rows;
```

---

## 📝 Ejemplos de Uso

### Consulta Simple
```typescript
import { query } from '@/lib/db';

const result = await query<User>(
  'SELECT * FROM users WHERE role = $1',
  ['admin']
);
console.log(result.rows);
```

### Transacción
```typescript
import { transaction } from '@/lib/db';

const orderId = await transaction(async (client) => {
  // Crear orden
  const orderResult = await client.query(
    'INSERT INTO orders (event_id, user_id, quantity, total_price) VALUES ($1, $2, $3, $4) RETURNING id',
    [eventId, userId, quantity, price]
  );
  
  // Generar tickets
  for (let i = 0; i < quantity; i++) {
    await client.query(
      'INSERT INTO tickets (event_id, order_id, user_id) VALUES ($1, $2, $3)',
      [eventId, orderResult.rows[0].id, userId]
    );
  }
  
  return orderResult.rows[0].id;
});
```

### Paginación
```typescript
import { query, buildPaginationQuery } from '@/lib/db';

const page = 1;
const limit = 10;
const pagination = buildPaginationQuery({ page, limit, orderBy: 'created_at', orderDirection: 'DESC' });

const result = await query(
  `SELECT * FROM orders WHERE event_id = $1 ${pagination}`,
  [eventId]
);
```

---

## 🚨 Errores Comunes

### Error: "relation 'users' does not exist"
**Solución:** Ejecuta `docs/schema-postgresql.sql`

### Error: "password authentication failed"
**Solución:** Verifica las credenciales en `.env.local`

### Error: "connect ECONNREFUSED"
**Solución:** Asegúrate de que PostgreSQL esté corriendo:
```bash
# Windows
net start postgresql-x64-14

# Linux/Mac
sudo service postgresql start
```

---

## 📦 Próximos Pasos

1. **Actualizar endpoints API** para incluir `event_id`
2. **Actualizar componentes frontend** para seleccionar eventos
3. **Migrar datos existentes** (si aplica)
4. **Implementar autenticación JWT** completa
5. **Crear dashboard de gestión de eventos**

---

## 🔗 Recursos

- [node-postgres docs](https://node-postgres.com/)
- [PostgreSQL docs](https://www.postgresql.org/docs/)
- Archivo de esquema: `docs/schema-postgresql.sql`
- Cliente DB: `src/lib/db.ts`

---

## ⚠️ Notas Importantes

- **UUIDs:** Ahora todas las tablas usan UUID en lugar de TEXT
- **Relaciones:** Configuradas con ON DELETE CASCADE para mantener integridad
- **Índices:** Creados automáticamente para optimizar queries
- **Transacciones:** Usa `transaction()` para operaciones que requieren atomicidad
- **Pool de conexiones:** Configurado con 20 conexiones máximas

---

¿Dudas? Revisa el código en `src/lib/db.ts` o el esquema en `docs/schema-postgresql.sql`
