# 🏗️ ARQUITECTURA DE SEGURIDAD - Diagrama Completo

## FLUJO DE AUTENTICACIÓN

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENTE (Browser)                         │
│                                                                   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │            NEXT.JS + REACT COMPONENTS                   │   │
│  │                                                          │   │
│  │  ┌──────────────┐  ┌──────────────┐  ┌─────────────┐  │   │
│  │  │  LoginForm   │  │   Dashboard  │  │  useAuth()  │  │   │
│  │  └──────────────┘  └──────────────┘  └─────────────┘  │   │
│  │                                                          │   │
│  │         AuthContext (+ cookies httpOnly)               │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  Cookie Storage (Browser Managed)                       │   │
│  │  ┌──────────────┐  ┌──────────────────────────────┐    │   │
│  │  │   token      │  │ httpOnly, SameSite=Strict    │    │   │
│  │  │ (15 min)     │  │ Secure (HTTPS only)          │    │   │
│  │  └──────────────┘  └──────────────────────────────┘    │   │
│  │                                                          │   │
│  │  ┌──────────────┐  ┌──────────────────────────────┐    │   │
│  │  │ refreshToken │  │ httpOnly, SameSite=Strict    │    │   │
│  │  │  (7 days)    │  │ Secure (HTTPS only)          │    │   │
│  │  └──────────────┘  └──────────────────────────────┘    │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
                             ↓ HTTP/HTTPS
┌─────────────────────────────────────────────────────────────────┐
│                      NEXT.JS API ROUTES                          │
│                                                                   │
│  ┌────────────────────────────────────────────────────────┐    │
│  │            /api/auth/* (Endpoints)                     │    │
│  │                                                         │    │
│  │  POST /api/auth/login                                 │    │
│  │    ├─ Validar email/password (Zod)                   │    │
│  │    ├─ Verificar bcryptjs                             │    │
│  │    ├─ Crear JWT tokens                               │    │
│  │    └─ Devolver cookies httpOnly                      │    │
│  │                                                         │    │
│  │  POST /api/auth/register                              │    │
│  │    ├─ Validar datos (Zod)                            │    │
│  │    ├─ Hash contraseña (bcryptjs)                     │    │
│  │    ├─ Crear usuario en BD                            │    │
│  │    └─ Devolver cookies + datos                       │    │
│  │                                                         │    │
│  │  GET /api/auth/me                                    │    │
│  │    ├─ Verificar token desde cookies                 │    │
│  │    ├─ Obtener usuario de BD                         │    │
│  │    └─ Devolver datos usuario                        │    │
│  │                                                         │    │
│  │  POST /api/auth/logout                               │    │
│  │    ├─ Limpiar cookies                               │    │
│  │    └─ Devolver confirmación                         │    │
│  │                                                         │    │
│  │  POST /api/auth/refresh                              │    │
│  │    ├─ Verificar refreshToken                        │    │
│  │    ├─ Crear nuevo access token                      │    │
│  │    └─ Devolver nuevas cookies                       │    │
│  │                                                         │    │
│  │  ┌──────────────────────────────────────────────┐   │    │
│  │  │ Middleware (src/middleware.ts)               │   │    │
│  │  │ ┌─────────────────────────────────────────┐  │   │    │
│  │  │ │ Verificar autenticación                 │  │   │    │
│  │  │ │ Verificar roles (admin, validator, user)│  │   │    │
│  │  │ │ Permitir rutas públicas                │  │   │    │
│  │  │ │ Redirigir a /login si no autenticado   │  │   │    │
│  │  │ └─────────────────────────────────────────┘  │   │    │
│  │  └──────────────────────────────────────────────┘   │    │
│  │                                                         │    │
│  └────────────────────────────────────────────────────────┘    │
│                                                                   │
│  ┌────────────────────────────────────────────────────────┐    │
│  │        /api/protected/* (Con Autenticación)            │    │
│  │                                                         │    │
│  │  Todos los endpoints usan:                            │    │
│  │  ┌────────────────────────────────────────────────┐  │    │
│  │  │ 1. verifyAuthFromRequest(req)                  │  │    │
│  │  │ 2. Validar input con Zod                      │  │    │
│  │  │ 3. Operación en BD (parametrizado)            │  │    │
│  │  │ 4. Respuesta estándar: { success, data, ... } │  │    │
│  │  └────────────────────────────────────────────────┘  │    │
│  │                                                         │    │
│  └────────────────────────────────────────────────────────┘    │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
                             ↓ TCP/SSL
┌─────────────────────────────────────────────────────────────────┐
│                      PostgreSQL Database                         │
│                                                                   │
│  ┌────────────────────────────────────────────────────────┐    │
│  │                    TABLES                              │    │
│  │                                                         │    │
│  │  users                                                 │    │
│  │  ├─ id (UUID)                                         │    │
│  │  ├─ email (UNIQUE)                                    │    │
│  │  ├─ password_hash (bcrypt)                            │    │
│  │  ├─ role (admin | organizer | validator | user)       │    │
│  │  ├─ created_at                                        │    │
│  │  └─ [otros campos]                                    │    │
│  │                                                         │    │
│  │  orders, tickets, events, etc                         │    │
│  │  [con índices en columnas de búsqueda]                │    │
│  │                                                         │    │
│  └────────────────────────────────────────────────────────┘    │
│                                                                   │
│  ✅ Todas las queries parametrizadas ($1, $2, ...)              │
│  ✅ Transacciones atómicas para operaciones críticas            │
│  ✅ Índices en columnas frecuentes                              │
│  ✅ Backups automáticos                                         │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

---

## STACK DE SEGURIDAD

```
┌────────────────────────────────────────┐
│         CLIENTE                         │
├────────────────────────────────────────┤
│  React 18                               │
│  + AuthContext (estado)                │
│  + useApi (hook)                       │
│  + useAuth (hook)                      │
└────────────────────────────────────────┘
                    ↓
┌────────────────────────────────────────┐
│      NEXT.JS MIDDLEWARE                │
├────────────────────────────────────────┤
│  Verificar token (jose)                │
│  Verificar rol                         │
│  Redirigir si no autenticado           │
│  Headers de usuario                    │
└────────────────────────────────────────┘
                    ↓
┌────────────────────────────────────────┐
│      API ROUTES (/api/*)               │
├────────────────────────────────────────┤
│  verifyAuthFromRequest()               │
│  Validación Zod                        │
│  Lógica de negocio                     │
│  Respuesta estándar                    │
└────────────────────────────────────────┘
                    ↓
┌────────────────────────────────────────┐
│       CAPA DE BD                        │
├────────────────────────────────────────┤
│  node-postgres                         │
│  Queries parametrizadas                │
│  Transacciones (BEGIN/COMMIT)          │
│  Error handling                        │
└────────────────────────────────────────┘
                    ↓
┌────────────────────────────────────────┐
│      POSTGRESQL DATABASE               │
├────────────────────────────────────────┤
│  Tables with constraints               │
│  Índices optimizados                   │
│  Backups automáticos                   │
└────────────────────────────────────────┘
```

---

## FLUJO DE REQUEST AUTENTICADO

```
1. USUARIO HACE REQUEST
   │
   └─ fetch('/api/orders', { credentials: 'include' })
      │
      └─ Browser automáticamente agrega cookies:
         token=[JWT_TOKEN]
         refreshToken=[REFRESH_TOKEN]

2. LLEGA A MIDDLEWARE (middleware.ts)
   │
   ├─ Verificar que la ruta requiere auth
   │
   ├─ Leer token de cookies
   │
   ├─ Verificar token con jose (JWT)
   │  ├─ Si válido → continuar
   │  └─ Si inválido → redirigir a /login
   │
   ├─ Verificar rol si es ruta admin/validator
   │
   └─ Agregar headers X-User-Id, X-User-Role

3. LLEGA A API ROUTE (/api/orders/route.ts)
   │
   ├─ verifyAuthFromRequest(req)
   │  └─ Lee token de cookies
   │     └─ Verifica con jose
   │        └─ Devuelve payload { userId, role, ... }
   │
   ├─ Si no autenticado → apiError('Unauthorized', 401)
   │
   ├─ Validar input con Zod
   │  └─ Si inválido → apiError('Invalid', 400)
   │
   ├─ Transacción en BD:
   │  ├─ BEGIN
   │  ├─ Query 1: SELECT * FROM orders WHERE user_id = $1
   │  ├─ Query 2: [otras operaciones]
   │  └─ COMMIT
   │
   └─ apiSuccess(data)
      └─ { success: true, data: [...] }

4. RESPUESTA AL CLIENTE
   │
   └─ Browser recibe:
      ├─ JSON: { success: true, data: [...] }
      ├─ Headers: Set-Cookie (si token renovado)
      └─ Cookies actualizadas

5. RENDERIZAR EN COMPONENTE
   │
   └─ setOrders(data)
      └─ UI actualiza con nuevos datos
```

---

## PROTECCIONES POR CAPA

```
┌──────────────────────────────────────────────────┐
│ CLIENTE (Browser)                                 │
├──────────────────────────────────────────────────┤
│ ✅ HttpOnly Cookies   → No vulnerable a XSS       │
│ ✅ SameSite=Strict    → Protegido contra CSRF     │
│ ✅ Secure flag        → Solo HTTPS en producción │
│ ✅ Auto-refresh token → Token expira en 15 min   │
└──────────────────────────────────────────────────┘
                         ↓
┌──────────────────────────────────────────────────┐
│ MIDDLEWARE                                        │
├──────────────────────────────────────────────────┤
│ ✅ Verificar autenticación    → Cookies válidas  │
│ ✅ Verificar rol              → Access control   │
│ ✅ Redirigir no autenticados  → 401 → /login    │
│ ✅ Headers de usuario         → Auditoría       │
└──────────────────────────────────────────────────┘
                         ↓
┌──────────────────────────────────────────────────┐
│ API ROUTES                                        │
├──────────────────────────────────────────────────┤
│ ✅ Verificar token        → verifyAuthFromRequest│
│ ✅ Validar input          → Zod schemas         │
│ ✅ Parámetros SQL         → $1, $2, ... (escape)│
│ ✅ Error handling         → Sin stack traces    │
│ ✅ Respuesta estándar     → Formato único       │
│ ✅ Logging                → Auditoría cambios  │
└──────────────────────────────────────────────────┘
                         ↓
┌──────────────────────────────────────────────────┐
│ BASE DE DATOS                                     │
├──────────────────────────────────────────────────┤
│ ✅ Queries parametrizadas  → No SQL injection    │
│ ✅ Transacciones           → Atomicidad         │
│ ✅ Índices                 → Performance         │
│ ✅ Constraints             → Data integrity     │
│ ✅ Backups                 → Recuperación       │
│ ✅ RBAC (roles)            → Access control     │
└──────────────────────────────────────────────────┘
```

---

## MANEJO DE ERRORES

```
REQUEST → VALIDACIÓN → OPERACIÓN → RESPUESTA

   ✅                ✅            ✅
   │                │             │
   └─ apiError()    └─ try/catch   └─ apiSuccess()
      │                │             │
      ├─ Validación    ├─ DB error   ├─ 200 OK
      │  fallida       │  (rollback) │
      │                │             └─ { success: true }
      ├─ Auth error    └─ Generic
      │                   response
      ├─ 401 Unauth
      │
      └─ 400/500
         { success: false, error: '...' }

IMPORTANTE:
❌ Nunca devolver: { success: false, error: error.stack }
✅ Siempre devolver: { success: false, error: 'User error' }

Logging en servidor:
✅ console.error(error) // Detalles
✅ Enviar a servicio de monitoreo
✅ No al cliente (seguridad)
```

---

## REFRESH TOKEN FLOW

```
ESCENARIO: Token expira a los 15 minutos

1. Usuario hace request con token expirado
   │
   └─ API devuelve: 401 Unauthorized

2. Hook useApi detecta 401
   │
   ├─ POST /api/auth/refresh
   │  ├─ Lee refreshToken de cookies
   │  ├─ Verifica con jose
   │  └─ Crea nuevo access token
   │
   └─ Browser recibe nuevas cookies
      ├─ token (nuevo, 15 min)
      └─ refreshToken (sin cambios, 7 días)

3. Hook reintenta request original
   │
   └─ Ahora funciona con nuevo token

4. Usuario no se da cuenta (transparente)
   │
   └─ UX sin interrupciones ✅

ESCENARIO: Refresh token expira (7 días)

1. POST /api/auth/refresh falla
   │
   └─ Browser detecta error

2. Redirigir a /login
   │
   └─ Usuario hace login de nuevo

3. Nuevos tokens creados
   │
   └─ Sesión reiniciada
```

---

## COMPONENTES CLAVE

```
src/lib/auth-utils.ts
├─ createToken()              → Crear JWT (15 min)
├─ createRefreshToken()       → Crear refresh (7 días)
├─ verifyToken()              → Verificar JWT
├─ verifyRefreshToken()       → Verificar refresh
├─ getTokenFromRequest()      → Leer de cookies
├─ setTokenCookies()          → Guardar en cookies
└─ clearTokenCookies()        → Limpiar cookies

src/lib/validators.ts
├─ loginSchema               → Validación login
├─ registerSchema            → Validación registro
├─ createTicketSchema        → Validación ticket
└─ [más schemas por feature]

src/lib/api-utils.ts
├─ apiSuccess()              → Respuesta exitosa
├─ apiError()                → Respuesta error
└─ ApiResponse<T>            → Tipo genérico

src/hooks/use-api.ts
├─ useApi()                  → Hook principal
└─ request()                 → Con auto-refresh

src/context/auth-context.tsx
├─ AuthProvider              → Context provider
├─ useAuth()                 → Hook de uso
├─ login()                   → Login
├─ logout()                  → Logout
├─ register()                → Registro
└─ refreshAuth()             → Refrescar sesión
```

---

## PRÓXIMAS CAPAS DE SEGURIDAD (Roadmap)

```
NIVEL 1: ✅ IMPLEMENTADO
├─ Autenticación JWT
├─ HttpOnly Cookies
├─ Control de acceso
└─ Validación de entrada

NIVEL 2: ⏳ PRÓXIMA SEMANA
├─ Rate limiting
├─ SQL injection prevention
├─ Transacciones atómicas
└─ Logging centralizado

NIVEL 3: ⏳ PRÓXIMAS 2 SEMANAS
├─ Caché (Redis)
├─ Índices BD
├─ Monitoreo/alertas
└─ 2FA (opcional)

NIVEL 4: ⏳ PRODUCCIÓN
├─ WAF (Web App Firewall)
├─ DDoS protection
├─ Security headers
└─ Penetration testing
```

---

**Última actualización:** Hoy  
**Validez:** Referencia permanente  
**Status:** ✅ Arquitectura estable
