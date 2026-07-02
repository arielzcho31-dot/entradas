# 🔥 SETUP POST-AUDITORÍA - TicketWise

## Lo que Cambió

Se implementaron **cambios críticos de seguridad** sin romper el proyecto actual. Ahora tienes:

✅ **Autenticación segura** con JWT + Refresh Tokens  
✅ **Cookies httpOnly** para proteger contra XSS  
✅ **Validación centralizada** con Zod  
✅ **Middleware** para proteger rutas  
✅ **Manejo de errores** estandarizado  

---

## 📦 Instalación

```bash
# 1. Instalar nuevas dependencias
npm install

# 2. Generar secretos seguros
bash scripts/generate-secrets.sh

# 3. Actualizar .env.local
# Copiar valores de secretos generados
# IMPORTANTE: NO COMMITEAR .env.local
```

---

## 🔐 Configuración de Ambiente

### Paso 1: Copiar template
```bash
cp .env.example .env.local
```

### Paso 2: Generar secretos
```bash
bash scripts/generate-secrets.sh
```

Obtendrás algo como:
```
JWT_SECRET=a7b8c9d0e1f2g3h4i5j6k7l8m9n0o1p2...
REFRESH_TOKEN_SECRET=x9y8z7w6v5u4t3s2r1q0p9o8n7m6l5k4...
```

### Paso 3: Actualizar .env.local
```env
JWT_SECRET=<pegá el valor del paso anterior>
REFRESH_TOKEN_SECRET=<pegá el valor del paso anterior>
DATABASE_PASSWORD=<cambia esto por contraseña segura>
EMAIL_PASSWORD=<tu app password de Gmail>
```

### Paso 4: Verificar que está en .gitignore
```bash
grep ".env.local" .gitignore
# Debe mostrar: .env.local
```

---

## 🚀 Comandos

```bash
# Desarrollo
npm run dev

# Build
npm run build

# Production
npm start

# Generar secretos
bash scripts/generate-secrets.sh

# TypeCheck
npm run typecheck

# Lint
npm run lint
```

---

## 📋 Cambios en Tu Código

### Antes (❌ Inseguro):
```typescript
// Login guardaba token en localStorage
localStorage.setItem('token', token);

// Context leía desde localStorage
const storedUser = localStorage.getItem('ticketwise_user');
```

### Ahora (✅ Seguro):
```typescript
// Cookies httpOnly (automático en servidor)
response.cookies.set('token', token, { httpOnly: true });

// Context obtiene de servidor vía /api/auth/me
const response = await fetch("/api/auth/me", { credentials: 'include' });
```

---

## 🔄 Uso en Componentes

### Antes (❌):
```typescript
const response = await fetch('/api/orders');
```

### Ahora (✅):
```typescript
import { useApi } from '@/hooks/use-api';

export function MyComponent() {
  const { request } = useApi();
  
  const getOrders = async () => {
    const { data } = await request('/api/orders');
    // Token se envía automáticamente en cookies
    // Si expira, se renueva automáticamente
  };
}
```

---

## 🛡️ Nuevos Endpoints de Auth

| Endpoint | Método | Descripción |
|----------|--------|-------------|
| `/api/auth/login` | POST | Login con email/password |
| `/api/auth/register` | POST | Registración |
| `/api/auth/me` | GET | Obtener usuario actual |
| `/api/auth/logout` | POST | Logout |
| `/api/auth/refresh` | POST | Renovar token (automático) |

---

## ⚠️ Cambios que Necesitas Revisar

### 1. Si Tienes Otros Endpoints API
Convierte a formato estándar:

```typescript
// ❌ Antes
export async function GET(req: Request) {
  return Response.json({ users: [...] });
}

// ✅ Después
import { apiSuccess, apiError } from '@/lib/api-utils';

export async function GET(req: Request) {
  try {
    const auth = await verifyAuthFromRequest(req);
    if (!auth) return apiError('Unauthorized', 401);
    
    const data = await getUsers();
    return apiSuccess(data);
  } catch (error) {
    return apiError('Server error', 500);
  }
}
```

### 2. Queries SQL Parametrizadas
Asegúrate que TODAS usan parámetros:

```typescript
// ❌ Vulnerable
const user = await db.query(`SELECT * FROM users WHERE id = '${userId}'`);

// ✅ Seguro
const user = await db.query('SELECT * FROM users WHERE id = $1', [userId]);
```

### 3. Operaciones Críticas con Transacciones
Para compras, tickets, etc:

```typescript
// ✅ Transacción
const client = await db.connect();
try {
  await client.query('BEGIN');
  await client.query('INSERT INTO orders ...');
  await client.query('INSERT INTO tickets ...');
  await client.query('COMMIT');
} catch (error) {
  await client.query('ROLLBACK');
  throw error;
} finally {
  client.release();
}
```

---

## 🧪 Testing

### Probar Login
```bash
curl -X POST http://localhost:9004/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123"}'
```

### Verificar Token
```bash
# Debe devolver datos del usuario
curl http://localhost:9004/api/auth/me \
  -b "token=<token_del_login>"
```

---

## 📚 Archivos Nuevos/Modificados

**Nuevos:**
- `src/lib/api-utils.ts` - Respuestas API estándar
- `src/lib/validators.ts` - Validación con Zod
- `src/lib/auth-utils.ts` - Utilidades JWT
- `src/hooks/use-api.ts` - Hook para requests seguros
- `src/app/api/auth/me/route.ts` - Get current user
- `src/app/api/auth/logout/route.ts` - Logout
- `src/app/api/auth/refresh/route.ts` - Refresh token
- `.env.example` - Template de variables
- `scripts/generate-secrets.sh` - Generador de secretos
- `SECURITY_CHANGES.md` - Documentación de cambios

**Modificados:**
- `src/context/auth-context.tsx` - Usa cookies en lugar de localStorage
- `src/app/api/auth/login/route.ts` - Seguridad mejorada
- `src/app/api/auth/register/route.ts` - Nuevo con bcryptjs
- `src/middleware.ts` - Protección de rutas
- `package.json` - Dependencias actualizadas

---

## ❌ Lo que Falta (Próxima Semana)

- [ ] Rate limiting en auth endpoints
- [ ] Transacciones en operaciones de compra
- [ ] Eliminar código Firebase
- [ ] Auditar todas las queries SQL
- [ ] Logging centralizado
- [ ] Tests E2E

---

## 🆘 Troubleshooting

### Error: "Cannot find module 'jose'"
```bash
npm install
```

### Error: "DATABASE_PASSWORD not set"
```bash
# Verificar .env.local existe y tiene DATABASE_PASSWORD
cat .env.local | grep DATABASE_PASSWORD
```

### Cookies no se guardan
```typescript
// Asegurate que fetch incluye credentials
fetch('/api/...', { credentials: 'include' })
```

### Token expira muy rápido
El access token es 15 minutos (por seguridad).  
El refresh token es 7 días (automático).

---

## 📞 Soporte

Revisar `SECURITY_CHANGES.md` para más detalles.

**¿Preguntas?** Lee el código de los nuevos archivos, está bien comentado.
