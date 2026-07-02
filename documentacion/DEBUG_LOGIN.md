# 🔧 DEBUG - Login No Reconoce Usuario en BD

## Problema
Usuario existe en BD pero no se reconoce al hacer login.

## Pasos para Debuggear

### 1️⃣ Verificar Conexión a PostgreSQL
```bash
# Conectar directamente
psql -h 127.0.0.1 -U postgres -d ticketwase2

# En la terminal psql, verificar que la tabla existe
\dt users

# Ver estructura de la tabla
\d users
```

### 2️⃣ Probar Conexión desde Node.js
```bash
# Ejecutar script de prueba
node scripts/test-db.js

# Probar con un email específico
node scripts/test-db.js tu_email@example.com
```

**Esperado:**
```
✅ Connected! Current time: ...
✅ Found X users:
   1. email@example.com (user)
```

### 3️⃣ Verificar Usuario en BD
```bash
bash scripts/check-user.sh tu_email@example.com
```

**Debería mostrar:**
- id: UUID
- email: tu_email@example.com
- password_hash: Debe tener 60 caracteres (bcrypt)
- role: user/admin/etc
- created_at: timestamp

### 4️⃣ Verificar Health Check API
```bash
# Iniciar servidor
npm run dev

# En otra terminal, verificar que BD está conectada
curl http://localhost:9004/api/health

# Debería responder:
{
  "status": "ok",
  "database": "connected",
  "timestamp": "...",
  "version": "PostgreSQL ..."
}
```

### 5️⃣ Probar Login desde API
```bash
# Llamar endpoint de login
curl -X POST http://localhost:9004/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "tu_email@example.com",
    "password": "tu_contraseña"
  }'
```

**Revisa la consola del servidor (npm run dev) para ver logs detallados:**
- `📤 Executing query: ...` - Query que se ejecuta
- `📥 Query result rows: X` - Cuántos usuarios encontró
- `👤 User found: email` - Si encontró el usuario
- `🔐 Verifying password: ...` - Si verificó la contraseña

### 6️⃣ Verificar que la Contraseña está Hasheada
En psql:
```sql
SELECT email, password_hash, LENGTH(password_hash) as hash_len FROM users LIMIT 5;
```

**hash_len debe ser 60** (longitud de bcrypt). Si es más corto, la contraseña no está hasheada.

### 7️⃣ Si la Contraseña NO está Hasheada

**El usuario fue creado sin hashear la contraseña. Opciones:**

#### Opción A: Crear Usuario Nuevo (Recomendado)
```bash
# Llamar endpoint /api/auth/register para crear nuevo usuario
# El password se hashea automáticamente
curl -X POST http://localhost:9004/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "nuevo@example.com",
    "password": "contraseña_segura_123",
    "display_name": "Mi Nombre"
  }'
```

#### Opción B: Hashear Contraseñas Existentes (SQL)
```sql
-- En psql, actualizar contraseñas sin hashear
UPDATE users 
SET password_hash = crypt(password_hash, gen_salt('bf'))
WHERE length(password_hash) < 60;
```

Nota: Requiere `pgcrypto` extension.

## Checklist de Conexión

- [ ] PostgreSQL está corriendo en 127.0.0.1:5432
- [ ] Base de datos `ticketwase2` existe
- [ ] Usuario `postgres` puede conectar
- [ ] `.env.local` tiene credenciales correctas:
  ```
  DATABASE_HOST=127.0.0.1
  DATABASE_PORT=5432
  DATABASE_NAME=ticketwase2
  DATABASE_USER=postgres
  DATABASE_PASSWORD=124783
  ```
- [ ] Tabla `users` existe y tiene datos
- [ ] Contraseñas están hasheadas (60 caracteres)
- [ ] `npm run dev` ejecuta sin errores
- [ ] `/api/health` responde OK
- [ ] Login intenta conectar (ver logs en consola)

## Logs Esperados en Consola

Al hacer login, deberías ver:

```
🔐 Login attempt for: email@example.com
📤 Executing query: SELECT id, email... WHERE LOWER(email)...
📥 Query result rows: 1
👤 User found: email@example.com
🔍 Found user: { id: "...", email: "...", role: "user", hasPasswordHash: true }
🔐 Verifying password...
✅ Password verification result: true
✅ Password valid, creating tokens...
✅ Login successful for: email@example.com
```

Si ves algo diferente, el problema está en ese paso específico.

## Errores Comunes

**"User NOT found in database"**
- ❌ El usuario no existe en BD
- ✅ Verificar con: `bash scripts/check-user.sh email@example.com`

**"Invalid password"**
- ❌ Contraseña incorrecta O no está hasheada
- ✅ Verificar hash length en BD

**"Database connection error"**
- ❌ No puede conectar a PostgreSQL
- ✅ Verificar `.env.local` y que postgres está corriendo

**"Query took Xms"**
- ⚠️ Query es lenta (pero funciona)
- ✅ Normal si X < 5000ms

## Soporte

Si aún no funciona después de estos pasos:
1. Compartir logs de consola (npm run dev)
2. Resultado de: `node scripts/test-db.js tu_email@example.com`
3. Resultado de: `bash scripts/check-user.sh tu_email@example.com`
