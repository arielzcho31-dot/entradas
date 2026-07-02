# ✅ CHECKLIST POST-AUDITORÍA

## Fase 1: Implementación (Completada ✅)

- [x] Crear `src/lib/api-utils.ts` - Respuestas estándar
- [x] Crear `src/lib/validators.ts` - Validación Zod
- [x] Crear `src/lib/auth-utils.ts` - JWT utilities
- [x] Actualizar `src/context/auth-context.tsx` - Cookies + API
- [x] Crear `/api/auth/me` - Get current user
- [x] Crear `/api/auth/logout` - Logout seguro
- [x] Crear `/api/auth/refresh` - Refresh token
- [x] Actualizar `/api/auth/login` - Seguridad mejorada
- [x] Crear `/api/auth/register` - Con bcryptjs
- [x] Crear `src/middleware.ts` - Protección de rutas
- [x] Crear `src/hooks/use-api.ts` - Hook API seguro
- [x] Actualizar `package.json` - Dependencias
- [x] Crear `.env.example` - Template
- [x] Crear `scripts/generate-secrets.sh` - Generador
- [x] Crear `SECURITY_CHANGES.md` - Documentación
- [x] Crear `SETUP_POST_AUDIT.md` - Setup guide
- [x] Crear este checklist

---

## Fase 2: Setup Local (Hazlo Ahora)

- [ ] `npm install` - Instalar nuevas dependencias
- [ ] `bash scripts/generate-secrets.sh` - Generar secretos
- [ ] Copiar valores de secretos a `.env.local`
- [ ] Verificar `.env.local` no está en Git
- [ ] Cambiar `DATABASE_PASSWORD`
- [ ] Cambiar `EMAIL_PASSWORD`
- [ ] `npm run dev` - Iniciar servidor
- [ ] Probar login con cuenta existente
- [ ] Probar registración
- [ ] Verificar cookies en DevTools (Application → Cookies)

---

## Fase 3: Testing (Esta Semana)

### Tests Manuales
- [ ] Probar login con email/password válidos
- [ ] Probar login con credenciales incorrectas
- [ ] Probar registración nuevo usuario
- [ ] Probar registración con email duplicado
- [ ] Probar logout
- [ ] Verificar token expira en 15 min
- [ ] Verificar refresh token renueva acceso
- [ ] Probar acceso a `/dashboard` sin login (redirige a `/login`)
- [ ] Probar acceso a `/dashboard/admin` sin rol admin
- [ ] Probar que `/api/auth/me` devuelve usuario actual

### Cookies
- [ ] Token en httpOnly cookie
- [ ] Refresh token en httpOnly cookie
- [ ] Cookies desaparecen en logout
- [ ] Cookies no visibles en JavaScript

### Endpoints Existentes
- [ ] Verificar que endpoints actuales funcionan
- [ ] Verificar que requests incluyen `credentials: 'include'`
- [ ] Verificar manejo de errores API

---

## Fase 4: Implementación de Cambios (Próxima Semana)

### SQL Injection Prevention
- [ ] Revisar `src/app/api/orders/route.ts`
- [ ] Revisar `src/app/api/tickets/route.ts`
- [ ] Revisar `src/app/api/users/route.ts`
- [ ] Parametrizar TODAS las queries
- [ ] Crear test para SQL injection

### Transacciones
- [ ] Implementar en compra de tickets
- [ ] Implementar en creación de órdenes
- [ ] Implementar en actualización de estado
- [ ] Verificar rollback en errores

### Rate Limiting
- [ ] Crear `src/lib/rate-limit.ts`
- [ ] Aplicar en `/api/auth/login`
- [ ] Aplicar en `/api/auth/register`
- [ ] Aplicar en `/api/tickets/validate`
- [ ] Configurar límites: 5 intentos/minuto

### Validación de Entrada
- [ ] Actualizar `/api/orders` con schema
- [ ] Actualizar `/api/tickets` con schema
- [ ] Actualizar `/api/events` con schema
- [ ] Actualizar `/api/users` con schema
- [ ] Crear tests de validación

### Manejo de Errores
- [ ] Centralizar logging
- [ ] Sin stack traces en respuestas
- [ ] Mensajes de error genéricos al cliente
- [ ] Logs detallados en servidor

---

## Fase 5: Limpieza (Próximas 2 Semanas)

### Eliminar Firebase
- [ ] Eliminar `src/lib/firebase.ts`
- [ ] Eliminar `src/lib/export-firebase.ts`
- [ ] Eliminar imports de firebase
- [ ] Actualizar `next.config.ts` (remover storage.googleapis.com)
- [ ] Eliminar `scripts/firebase-to-supabase.js`
- [ ] Remover paquete `firebase` de `package.json`

### Limpiar Archivos
- [ ] Eliminar `src/middleware.ts.bak`
- [ ] Eliminar todos los `.bak` files
- [ ] Eliminar archivos temporales

### Actualizar Documentación
- [ ] Actualizar `README.md`
- [ ] Actualizar `docs/deployment.md`
- [ ] Crear `docs/security.md`
- [ ] Crear `docs/api-reference.md`

---

## Fase 6: Performance & Monitoreo (Antes de Producción)

### Performance
- [ ] Agregar índices en BD:
  - `users(email)` - Búsqueda frecuente
  - `orders(user_id)` - Filtrado por usuario
  - `tickets(event_id)` - Filtrado por evento
  - `tickets(qr_code)` - Validación QR
- [ ] Implementar caching (Redis para eventos)
- [ ] Optimizar queries (evitar N+1)
- [ ] Implementar paginación

### Monitoreo
- [ ] Configurar logs (Winston o Pino)
- [ ] Alertas para errores críticos
- [ ] Métricas de performance
- [ ] Tracking de cambios sensibles (creación de tickets, órdenes)

---

## Fase 7: Producción (Antes de Deploy)

### Seguridad
- [ ] Certificado SSL/HTTPS
- [ ] Headers de seguridad (CSP, X-Frame-Options, etc)
- [ ] CORS configurado correctamente
- [ ] Backups automáticos de BD
- [ ] Secretos en Key Management Service

### Testing
- [ ] Tests unitarios (80% coverage)
- [ ] Tests E2E (Playwright)
- [ ] Tests de carga
- [ ] Penetration testing (opcional)

### Deployment
- [ ] CI/CD pipeline
- [ ] Migrations automáticas
- [ ] Health checks
- [ ] Rollback plan

---

## 🎯 Resumen de Estado

| Aspecto | Estado | Prioridad |
|---------|--------|-----------|
| Autenticación | ✅ Implementado | CRÍTICA |
| Validación | ✅ Centralizado | CRÍTICA |
| Cookies | ✅ HttpOnly | CRÍTICA |
| SQL Injection | ⏳ Pendiente | CRÍTICA |
| Rate Limiting | ⏳ Pendiente | ALTA |
| Transacciones | ⏳ Pendiente | ALTA |
| Firebase | ⏳ Eliminar | MEDIA |
| Performance | ⏳ Optimizar | MEDIA |
| Monitoreo | ⏳ Configurar | MEDIA |
| Docs | ✅ Actualizado | BAJA |

---

## 📊 Progreso

```
████████████░░░░░░░░░░░░░░░░░░░░░░░░░░░░ 30%

Completado: Arquitectura de seguridad base
Siguiente: Auditoría de queries SQL
```

---

**Última actualización:** Hoy
**Próxima revisión:** Fin de esta semana
