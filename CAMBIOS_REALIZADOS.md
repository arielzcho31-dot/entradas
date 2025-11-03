# 📝 Resumen de Cambios - Migración a PostgreSQL Multi-Evento

## ✅ Cambios Completados

### 1. **Base de Datos**
- ✅ Nuevo esquema PostgreSQL con soporte multi-evento
- ✅ Tabla `events` para gestionar múltiples eventos
- ✅ Tabla `ticket_types` para tipos de entrada por evento
- ✅ Tabla `event_organizers` para asignar roles por evento
- ✅ Columna `event_id` agregada a `orders` y `tickets`
- ✅ Migración de IDs `TEXT` a `UUID`
- ✅ Índices optimizados para consultas frecuentes
- ✅ Triggers para `updated_at` automático
- ✅ Vistas para estadísticas y validaciones

### 2. **Infraestructura**
- ✅ Cliente PostgreSQL (`src/lib/db.ts`) con pool de conexiones
- ✅ Helpers para transacciones, paginación y queries dinámicas
- ✅ Test de conexión automático en desarrollo
- ✅ Manejo de errores mejorado

### 3. **Dependencias**
- ✅ Agregado: `pg` (node-postgres) y `@types/pg`
- ✅ Eliminado: `@supabase/auth-helpers-nextjs`, `@supabase/supabase-js`
- ✅ Eliminado: `mongodb`, `mongoose` (no se usaban)

### 4. **Archivos Eliminados**

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
- `supabaseClient.ts` (raíz)
- `README-supabase.md`
- `src/scripts/set-admin-role.ts`
- `src/config/index.ts`

#### Otros:
- `src/lib/mongodb.ts`
- `src/lib/db-functions.ts`
- `reset-data.js`
- `users.json`, `orders.json`

### 5. **Archivos Nuevos**
- ✅ `src/lib/db.ts` - Cliente PostgreSQL
- ✅ `docs/schema-postgresql.sql` - Esquema completo
- ✅ `docs/apply-schema.sql` - Script de instalación
- ✅ `docs/POSTGRESQL_MIGRATION.md` - Guía de migración
- ✅ `.env.example` - Variables de entorno
- ✅ `scripts/verify-setup.js` - Verificación de configuración

### 6. **Archivos Actualizados**
- ✅ `docs/bdd.txt` - Esquema actualizado
- ✅ `package.json` - Dependencias actualizadas
- ✅ `README.md` - Instrucciones actualizadas

---

## 🔄 Próximos Pasos (Código que Hay que Actualizar)

### ⚠️ IMPORTANTE: Los siguientes archivos AÚN usan Supabase y deben migrarse:

#### 1. API Routes (src/app/api/)
- `auth/login/route.ts` - Usa `createClient` de Supabase
- `auth/register/route.ts` - Usa `createClient` de Supabase
- `auth/check-role/route.ts` - Usa `createRouteHandlerClient`
- `users/route.ts` - Usa `createClient` de Supabase
- `users/[id]/route.ts` - Usa `createClient` de Supabase
- `users/[id]/update-role/route.ts` - Usa Supabase
- `orders/route.ts` - Usa `createClient` de Supabase
- `orders/[id]/tickets/route.ts` - Usa Supabase
- `tickets/generate/route.ts` - Usa Supabase
- `upload-receipt/route.ts` - Usa Supabase
- `dashboard/stats/route.ts` - Usa Supabase
- `dashboard/recent-sales/route.ts` - Usa Supabase

#### 2. Pages/Components (src/app/)
- `events/[id]/page.tsx` - Importa supabaseClient
- `dashboard/my-tickets/page.tsx` - Usa supabase
- `dashboard/scan/page.tsx` - Usa supabase
- `dashboard/users/page.tsx` - Usa supabase
- `dashboard/profile/page.tsx` - Usa supabase
- `dashboard/validator/page.tsx` - Usa supabase
- `dashboard/organizer/page.tsx` - Usa supabase
- `dashboard/generated-tickets/page.tsx` - Usa supabase
- `dashboard/orders/page.tsx` - Usa supabase

#### 3. Context
- `src/context/auth-context.tsx` - Usa supabaseClient

#### 4. Types
- `src/types/index.ts` - Importa tipos de Supabase

---

## 📋 Checklist de Migración de Código

Para cada archivo que usa Supabase, realizar:

### Paso 1: Reemplazar imports
```typescript
// ❌ ANTES
import { createClient } from '@supabase/supabase-js';
const supabase = createClient(url, key);

// ✅ AHORA
import { query, transaction } from '@/lib/db';
```

### Paso 2: Reemplazar queries
```typescript
// ❌ ANTES
const { data, error } = await supabase
  .from('users')
  .select('*')
  .eq('email', email)
  .single();

// ✅ AHORA
const result = await query<User>(
  'SELECT * FROM users WHERE email = $1 LIMIT 1',
  [email]
);
const user = result.rows[0];
```

### Paso 3: Agregar event_id donde corresponda
```typescript
// ✅ AHORA todas las operaciones con orders/tickets requieren event_id
await query(
  'INSERT INTO orders (event_id, user_id, quantity, total_price) VALUES ($1, $2, $3, $4)',
  [eventId, userId, quantity, price]
);
```

### Paso 4: Actualizar tipos
```typescript
// ❌ ANTES
import { User } from '@supabase/supabase-js';

// ✅ AHORA
interface User {
  id: string;
  email: string;
  display_name?: string;
  role: 'admin' | 'organizer' | 'validator' | 'user';
  // ...
}
```

---

## 🎯 Pasos para Aplicar los Cambios

### 1. Instalar Dependencias
```bash
npm install
```

### 2. Configurar .env.local
Edita `.env.local` y configura tu password de PostgreSQL:
```env
DATABASE_PASSWORD=tu_password_real
```

### 3. Crear la Base de Datos
```bash
# Opción 1: Desde terminal
psql -U postgres -d ticketwase2 -f docs/apply-schema.sql

# Opción 2: Desde pgAdmin
# Ejecuta el archivo docs/schema-postgresql.sql
```

### 4. Verificar Configuración
```bash
node scripts/verify-setup.js
```

### 5. Empezar a Migrar Código
Comienza con las rutas API más simples y avanza progresivamente.

---

## 📞 Siguiente Sesión

En la próxima sesión podemos:
1. ✅ Migrar rutas API de autenticación (`/api/auth/*`)
2. ✅ Migrar rutas de usuarios (`/api/users/*`)
3. ✅ Actualizar componentes de dashboard
4. ✅ Implementar gestión de eventos en frontend
5. ✅ Crear formularios para crear/editar eventos

---

## 📚 Recursos

- **Documentación completa:** `docs/POSTGRESQL_MIGRATION.md`
- **Esquema SQL:** `docs/schema-postgresql.sql`
- **Cliente DB:** `src/lib/db.ts`
- **Variables de entorno:** `.env.example`

---

## ⚠️ Notas Importantes

1. **No elimines** los archivos que aún usan Supabase hasta migrarlos
2. **Backup:** Asegúrate de tener backup de datos si migras de producción
3. **Testing:** Prueba cada endpoint migrado antes de continuar
4. **Event_id:** No olvides agregar `event_id` en todas las operaciones
5. **UUIDs:** Todos los IDs ahora son UUID, no strings

---

**Estado actual:** ✅ Infraestructura lista, falta migrar código de aplicación
