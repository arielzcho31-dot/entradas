# Supabase + PostgreSQL Setup

## 1. Crea tu proyecto en https://app.supabase.com/
- Obtén la URL y la clave anon.

## 2. Configura las tablas:
- users
- orders

# Supabase: Definición de tablas para migración

## Importante sobre la columna `id`

- Asegúrate de que la columna `id` en las tablas `users` y `orders` sea de tipo `text` **y NO tenga la propiedad "identity" ni "auto-increment"**.
- Si ya creaste la tabla con `id` como identity/autoincrement, elimínala y vuelve a crearla solo como `text` y primary key.

### Ejemplo SQL para crear la tabla correctamente:

```sql
create table users (
  id text primary key,
  displayName text,
  ci text,
  usuario text,
  numero text,
  email text,
  createdAt timestamp,
  role text,
  universidad text
);

create table orders (
  id text primary key,
  userId text,
  userName text,
  userEmail text,
  ticketId text,
  ticketName text,
  quantity integer,
  totalPrice integer,
  receiptUrl text,
  createdAt timestamp,
  status text
);
```

- Si necesitas borrar la tabla para corregirla:
```sql
drop table if exists users;
drop table if exists orders;
```

## Tabla: users

Crea una tabla llamada `users` con los siguientes campos:

- id: text, primary key
- displayName: text
- ci: text (nullable)
- usuario: text (nullable)
- numero: text (nullable)
- email: text
- createdAt: timestamp (nullable)
- role: text
- universidad: text (nullable)

## Tabla: orders

Crea una tabla llamada `orders` con los siguientes campos:

- id: text, primary key
- userId: text (relación con users.id)
- userName: text
- userEmail: text
- ticketId: text
- ticketName: text
- quantity: integer
- totalPrice: integer
- receiptUrl: text
- createdAt: timestamp
- status: text

## Notas

- Puedes crear las tablas y campos desde el "Table Editor" en el panel de Supabase.
- Asegúrate de que los nombres de los campos coincidan exactamente con los del JSON y el script de migración.
- Si quieres relaciones, puedes agregar una foreign key de `orders.userId` a `users.id` (opcional).

## 3. Configura el bucket de storage:
- Crea un bucket llamado `receipts` para comprobantes.

## 4. Configura tu app:
- Edita `supabaseClient.ts` con tu URL y clave.

## 5. Uso en tu código:
```typescript
import { supabase } from './supabaseClient';

// Subir comprobante
const { data, error } = await supabase.storage
  .from('receipts')
  .upload('comprobante-123.jpg', archivo);

// Guardar orden
const { data, error } = await supabase
  .from('orders')
  .insert([{ user_id, receipt_url, ... }]);
```

## 6. Producción
- Puedes usar Supabase desde cualquier servidor o dominio.
- Solo necesitas la URL y la clave anon.

## Si tienes relaciones foráneas (foreign keys)

Para cambiar el tipo de columna `id` en `users` a `text` cuando existe una foreign key en `orders`, debes eliminar la restricción con `CASCADE`:

```sql
-- Elimina la clave foránea y la clave primaria con CASCADE
ALTER TABLE users DROP CONSTRAINT users_pkey CASCADE;

-- Ahora puedes cambiar el tipo de columna
ALTER TABLE users ALTER COLUMN id TYPE text;
ALTER TABLE orders ALTER COLUMN userId TYPE text;

-- Vuelve a agregar la clave primaria
ALTER TABLE users ADD PRIMARY KEY (id);

-- (Opcional) Vuelve a agregar la foreign key si la necesitas
ALTER TABLE orders
  ADD CONSTRAINT orders_userId_fkey FOREIGN KEY (userId) REFERENCES users(id);
```

**Nota:**  
Haz lo mismo para la tabla `orders` si necesitas cambiar su columna `id` a `text` y tiene relaciones foráneas.

--- 
Si tienes dudas, elimina y recrea las tablas como se mostró antes para evitar conflictos.

# SQL para crear tablas en Supabase (IDs como text, listo para migración)

```sql
-- Elimina las tablas si existen (incluye CASCADE para eliminar relaciones)
drop table if exists orders cascade;
drop table if exists users cascade;

-- Crea la tabla users
create table users (
  id text primary key,
  displayName text,
  ci text,
  usuario text,
  numero text,
  email text,
  createdAt timestamp,
  role text,
  universidad text
);

-- Crea la tabla orders
create table orders (
  id text primary key,
  userId text references users(id),
  userName text,
  userEmail text,
  ticketId text,
  ticketName text,
  quantity integer,
  totalPrice integer,
  receiptUrl text,
  createdAt timestamp,
  status text
);
```

# Solución a errores de migración

## 1. Error: Could not find the 'displayName' column of 'users' in the schema cache

Debes agregar la columna `displayName` a la tabla `users`.  
Ejecuta en el SQL Editor de Supabase:

```sql
alter table users add column displayName text;
```

Haz lo mismo para cualquier otra columna faltante que aparezca en los errores.

---

## 2. Error: violates foreign key constraint "orders_userid_fkey"

Esto ocurre porque intentas insertar órdenes antes de que existan los usuarios referenciados, o porque la tabla `users` está vacía.

**Solución:**
- Asegúrate de que la migración de usuarios se complete exitosamente antes de migrar órdenes.
- Si ya tienes datos en `orders` que no tienen usuario correspondiente, bórralos y vuelve a migrar.
- Si hiciste pruebas y tienes datos inconsistentes, puedes limpiar ambas tablas y volver a migrar:

```sql
delete from orders;
delete from users;
```

Luego ejecuta primero la migración de usuarios y después la de órdenes.

---

## 3. Verifica que la estructura de ambas tablas incluya todos los campos del JSON

Si falta algún campo, agrégalo con:

```sql
alter table users add column NOMBRE_CAMPO tipo;
alter table orders add column NOMBRE_CAMPO tipo;
```

-- Agrega la columna `password` a la tabla `users`

```sql
ALTER TABLE users ADD COLUMN password text;
```

# Configuración de Supabase Storage

## Error 400 al acceder a los comprobantes

Si recibes un error 400 (Bad Request) al intentar ver una imagen subida, es muy probable que tu bucket de almacenamiento no sea público.

### Solución: Hacer el bucket público

1.  Ve a tu proyecto en [app.supabase.com](https://app.supabase.com).
2.  En el menú de la izquierda, ve a **Storage**.
3.  Busca tu bucket (por ejemplo, `receipts`).
4.  Haz clic en los tres puntos (`...`) al lado del nombre del bucket y selecciona **"Bucket settings"**.
5.  Activa la opción **"This bucket is public"**.
6.  Guarda los cambios.

Una vez que el bucket sea público, las URLs generadas por `getPublicUrl()` funcionarán correctamente y las imágenes se podrán ver sin problemas.

### Políticas de acceso (Row Level Security)

Para un control más granular, puedes usar las políticas de acceso (RLS) en tu bucket. Por ejemplo, para permitir que cualquiera pueda leer (`SELECT`) los archivos del bucket `receipts`:

1.  Ve a **Storage** > **Policies**.
2.  Selecciona el bucket `receipts`.
3.  Crea una nueva política para `SELECT` con la siguiente configuración:
    -   **Policy name:** `Allow public read access`
    -   **Allowed operation:** `SELECT`
    -   **Target roles:** `anon`, `authenticated`
    -   **USING expression:** `true`

Esto asegura que cualquier persona con el enlace pueda ver los comprobantes.
