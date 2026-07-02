# 🔐 GUÍA RÁPIDA - Cambios de Seguridad

## TL;DR - Lo Más Importante

**Se implementó autenticación segura con JWT + Refresh Tokens + HttpOnly Cookies.**

### ✅ Cambios Principales

| Aspecto | Antes ❌ | Ahora ✅ |
|---------|----------|---------|
| **Tokens** | localStorage | httpOnly cookies |
| **Seguridad** | Vulnerable a XSS | Protegido contra XSS |
| **Expiración** | Infinita | 15 min (renovable 7 días) |
| **Control Acceso** | Débil | Middleware + Roles |
| **Validación** | Inconsistente | Zod centralizado |
| **Errores** | Stack traces visibles | Mensajes genéricos |

---

## 🚀 Setup (5 minutos)

```bash
# 1. Instalar
npm install

# 2. Generar secretos
bash scripts/generate-secrets.sh

# 3. Copiar a .env.local
# Pegar valores de secretos generados

# 4. Iniciar
npm run dev

# 5. Probar login
# http://localhost:9004/login
```

---

## 📚 Documentación

| Archivo | Propósito |
|---------|-----------|
| `AUDIT_SUMMARY.md` | 📊 Resumen ejecutivo de auditoría |
| `SECURITY_CHANGES.md` | 🔒 Detalles técnicos de cambios |
| `SETUP_POST_AUDIT.md` | 🔧 Guía de configuración |
| `CHECKLIST_AUDIT.md` | ✅ Progreso y tareas pendientes |
| `EXAMPLES_NEW_ARCHITECTURE.md` | 💡 Ejemplos de uso |

---

## 🔄 Flujo de Autenticación (Nuevo)

```
1. Usuario hace login
   └─ POST /api/auth/login
      ├─ Validar email/password (Zod)
      ├─ Verificar contraseña (bcryptjs)
      ├─ Generar tokens (JWT)
      └─ Devolver cookies httpOnly + datos usuario

2. Cliente recibe cookies automáticamente
   └─ Browser maneja cookies (seguro)
   └─ JavaScript NO puede acceder (httpOnly)

3. Requests posteriores incluyen cookies
   └─ fetch('/api/orders', { credentials: 'include' })
      ├─ Token en cookie se envía automático
      ├─ Servidor verifica token
      └─ Devuelve datos

4. Token expira (15 minutos)
   └─ Hook useApi detecta 401
      ├─ Intenta refresh automático
      ├─ POST /api/auth/refresh
      ├─ Obtiene nuevo token
      └─ Reintenta request original

5. Refresh token expira (7 días)
   └─ Usuario debe hacer login de nuevo
```

---

## 🛡️ Protecciones Implementadas

### 1. XSS Protection
```
❌ localStorage.setItem('token', token)  // Vulnerable a XSS
✅ response.cookies.set('token', token, { httpOnly: true })
   // JavaScript NO puede acceder incluso con XSS
```

### 2. CSRF Protection
```
✅ SameSite=Strict en cookies
   // Navegador NO envía cookies en cross-site requests
```

### 3. Session Hijacking
```
✅ Access Token (15 min) - Acceso limitado
✅ Refresh Token (7 días) - Renovación segura
   // Incluso si roban token, solo dura 15 minutos
```

### 4. SQL Injection (Próximo)
```
✅ Todas las queries con parámetros
   db.query('SELECT * FROM users WHERE id = $1', [userId])
   // Valores escapados automáticamente
```

### 5. Rate Limiting (Próximo)
```
✅ Máximo 5 intentos de login/minuto
✅ Máximo 10 validaciones QR/segundo
   // Protege contra brute force y DDoS
```

---

## 🎯 Próximos Pasos

### Esta Semana 🔴
- [ ] `npm install`
- [ ] Generar secretos: `bash scripts/generate-secrets.sh`
- [ ] Actualizar `.env.local`
- [ ] Probar login/logout
- [ ] Verificar cookies en DevTools

### Próxima Semana 🟡
- [ ] Implementar rate limiting
- [ ] Auditar queries SQL
- [ ] Crear transacciones atómicas
- [ ] Tests E2E con nuevos endpoints

### Próximas 2 Semanas 🟢
- [ ] Eliminar código Firebase
- [ ] Implementar logging
- [ ] Optimizaciones de BD (índices)
- [ ] Deployment a producción

---

## ⚠️ Cambios en tu Código

### Si Tenías Este Login:
```typescript
const response = await fetch('/api/auth/login', {
  method: 'POST',
  body: JSON.stringify({ email, password })
});

const { token } = await response.json();
localStorage.setItem('token', token);  // ❌ VIEJO
```

### Ahora Es:
```typescript
const response = await fetch('/api/auth/login', {
  method: 'POST',
  body: JSON.stringify({ email, password }),
  credentials: 'include'  // ✅ Guardar cookies
});

const { data } = await response.json();
// ✅ Token en cookie automáticamente
// ✅ No hay que guardarlo manualmente
```

### Si Hacías Requests:
```typescript
fetch('/api/orders', {
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('token')}`  // ❌ VIEJO
  }
});
```

### Ahora Es:
```typescript
fetch('/api/orders', {
  credentials: 'include'  // ✅ Cookies automáticas
});

// O usa el hook nuevo:
const { request } = useApi();
const orders = await request('/api/orders');  // ✅ TODO automático
```

---

## 🧪 Testing Rápido

```bash
# 1. Abre DevTools (F12) → Application → Cookies
# 2. Inicia servidor: npm run dev
# 3. Vé a http://localhost:9004/login
# 4. Login con credentials válidas
# 5. Verifica que aparecen 2 cookies:
#    - token (httpOnly, SameSite=Strict)
#    - refreshToken (httpOnly, SameSite=Strict)
# 6. Vé a /dashboard (debe funcionar)
# 7. Logout (cookies deben desaparecer)
```

---

## 📞 Ayuda Rápida

**P: ¿Dónde están mis tokens?**  
R: En cookies httpOnly. No puedes verlos en JavaScript (es lo bueno, protege contra XSS).

**P: ¿Cómo hago logout?**  
R: Ya está implementado. Los tokens se limpian automáticamente.

**P: ¿Qué pasa si el token expira?**  
R: El hook `useApi` detecta 401 y renueva automáticamente. El usuario no se da cuenta.

**P: ¿Necesito cambiar mis endpoints?**  
R: No inmediatamente. Pero sigue el formato estándar en futuros endpoints.

**P: ¿Y si tengo queries SQL vulnerables?**  
R: Próxima semana cubrimos eso. Por ahora, usa `$1, $2` en lugar de template strings.

---

## 🎓 Lectura Recomendada

Antes de tocar código sensible, lee:

1. **SECURITY_CHANGES.md** - Detalles de cambios
2. **EXAMPLES_NEW_ARCHITECTURE.md** - Ejemplos de código
3. **OWASP Top 10** - Vulnerabilidades comunes
4. **JWT Best Practices** - RFC 8725

---

## ✅ Estado

```
🟢 Autenticación        - Implementado
🟢 Control de acceso    - Implementado
🟢 Validación           - Implementado
🟡 Rate limiting        - Próximo
🟡 SQL Injection audit  - Próximo
🟡 Transacciones        - Próximo
🟡 Monitoreo            - Próximo
```

---

**Última actualización:** Hoy  
**Válido para:** Next.js 14+, PostgreSQL 12+, React 18+  
**Soporte:** Revisar documentación incluida
