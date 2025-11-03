# 🚀 Guía Rápida - Aplicar Esquema PostgreSQL

## Opción 1: Usando psql (Recomendado)

### Windows PowerShell:
```powershell
# Navega a la carpeta del proyecto
cd C:\Users\arieel\Desktop\VSS\web_modificable

# Aplica el esquema
psql -U postgres -d ticketwase2 -f docs\apply-schema.sql
```

### Si necesitas crear la base primero:
```powershell
# Conecta a PostgreSQL
psql -U postgres

# Dentro de psql:
CREATE DATABASE ticketwase2;
\q

# Ahora aplica el esquema
psql -U postgres -d ticketwase2 -f docs\apply-schema.sql
```

---

## Opción 2: Usando pgAdmin

1. Abre **pgAdmin**
2. Conecta a tu servidor PostgreSQL
3. Clic derecho en "Databases" → "Create" → "Database"
4. Nombre: `ticketwase2`
5. Clic derecho en `ticketwase2` → "Query Tool"
6. Abre el archivo `docs/schema-postgresql.sql`
7. Copia todo el contenido y pégalo en Query Tool
8. Presiona F5 o clic en "Execute"

---

## Opción 3: Desde código Node.js

```javascript
// scripts/setup-db.js
import { readFileSync } from 'fs';
import pg from 'pg';

const client = new pg.Client({
  host: 'localhost',
  port: 5432,
  database: 'ticketwase2',
  user: 'postgres',
  password: 'tu_password'
});

await client.connect();

const sql = readFileSync('docs/schema-postgresql.sql', 'utf-8');
await client.query(sql);

console.log('✅ Esquema aplicado correctamente');
await client.end();
```

Ejecutar:
```bash
node scripts/setup-db.js
```

---

## Verificar que funcionó

### Opción A: Desde psql
```sql
-- Conectar
psql -U postgres -d ticketwase2

-- Ver tablas
\dt

-- Debería mostrar:
--  events
--  event_organizers
--  orders
--  ticket_types
--  tickets
--  users

-- Ver datos de ejemplo
SELECT * FROM users;
SELECT * FROM events;
```

### Opción B: Desde la app
```bash
npm run db:setup
```

Debería mostrar:
```
✅ Conexión a PostgreSQL exitosa
```

---

## Errores Comunes

### "database does not exist"
**Solución:**
```sql
CREATE DATABASE ticketwase2;
```

### "password authentication failed"
**Solución:** Verifica tu password en `.env.local`

### "psql: command not found"
**Solución:** Agrega PostgreSQL al PATH:
```
C:\Program Files\PostgreSQL\16\bin
```

---

## Siguiente Paso

Una vez aplicado el esquema:
```bash
npm run dev
```

Verifica en consola:
```
✅ Conexión a PostgreSQL exitosa: 2025-11-01T...
```

---

## Reset (Borrar todo y empezar de nuevo)

Si necesitas resetear la base:
```sql
DROP DATABASE ticketwase2;
CREATE DATABASE ticketwase2;
```

Luego vuelve a aplicar el esquema.
