# 🎨 Actualización de URLs Amigables y Carpeta de Perfiles

## ✅ Cambios Implementados

### 1. **URLs Amigables con Slugs** 🔗

#### **Antes:**
```
/events/550e8400-e29b-41d4-a716-446655440000
```

#### **Después:**
```
/events/unidafest-2025
/events/concierto-rock-nacional
/events/feria-tecnologia-py
```

### 2. **Carpeta de Perfiles de Eventos** 📁

Las imágenes de eventos ahora se guardan en:
```
uploads/events_profile/
```

En lugar de:
```
uploads/events/
```

### 3. **Colores Actualizados en Gestión de Eventos** 🎨

Todos los campos de formulario ahora tienen:
- ✅ Fondos blancos/gris claro (`bg-white`)
- ✅ Bordes grises (`border-gray-300`)
- ✅ Texto oscuro legible (`text-gray-900`)
- ✅ Soporte completo dark mode

---

## 📋 INSTRUCCIONES PARA APLICAR CAMBIOS

### Paso 1: Ejecutar Script SQL

Debes ejecutar el siguiente script en tu base de datos PostgreSQL/Supabase:

```bash
# Si usas PostgreSQL local:
psql -U tu_usuario -d tu_base_de_datos -f docs/add-slug-column.sql

# Si usas Supabase:
# 1. Ve a Supabase Dashboard
# 2. SQL Editor
# 3. Copia y pega el contenido de docs/add-slug-column.sql
# 4. Ejecuta
```

**Contenido del script:**
- Agrega columna `slug` a tabla `events`
- Crea índice para búsquedas rápidas
- Genera slugs para eventos existentes automáticamente
- Asegura unicidad de slugs

### Paso 2: Verificar Carpeta de Uploads

Asegurate de que la carpeta exista:

```bash
# Windows PowerShell
mkdir uploads\events_profile -Force

# Linux/Mac
mkdir -p uploads/events_profile
```

### Paso 3: Reiniciar el Servidor

```bash
npm run dev
```

---

## 🔧 CÓMO FUNCIONAN LOS SLUGS

### Generación Automática

Cuando creas un evento llamado **"UNIDAFEST 2025"**, se genera automáticamente:

```
slug: "unidafest-2025"
```

### Reglas de Generación

1. **Convertir a minúsculas**: `UNIDAFEST` → `unidafest`
2. **Remover acentos**: `Música` → `musica`
3. **Reemplazar espacios con guiones**: `Festival 2025` → `festival-2025`
4. **Remover caracteres especiales**: `¡Wow!` → `wow`
5. **Limitar a 100 caracteres**
6. **Asegurar unicidad**: Si existe `evento-1`, crear `evento-1-2`

### Ejemplos

| Nombre del Evento | Slug Generado |
|-------------------|---------------|
| UNIDAFEST 2025 | `unidafest-2025` |
| Concierto: Rock Nacional | `concierto-rock-nacional` |
| ¡Gran Feria de Tecnología! | `gran-feria-de-tecnologia` |
| Maratón San Lorenzo | `maraton-san-lorenzo` |

---

## 🔍 API ACTUALIZADA

### Buscar Eventos

**Por Slug (Recomendado):**
```typescript
GET /api/events/unidafest-2025
```

**Por ID (Sigue funcionando):**
```typescript
GET /api/events/550e8400-e29b-41d4-a716-446655440000
```

### Respuesta de API

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "slug": "unidafest-2025",
  "name": "UNIDAFEST 2025",
  "description": "...",
  "event_date": "2025-12-15T00:00:00.000Z",
  "location": "Auditorio Central",
  "image_url": "/uploads/events_profile/user123-1730000000000.jpg",
  "status": "active"
}
```

---

## 📱 ACTUALIZACIÓN DE COMPONENTES

### HomePage (`src/app/page.tsx`)

```typescript
// ANTES
onClick={() => router.push(`/events/${event.id}`)}

// DESPUÉS
onClick={() => router.push(`/events/${event.slug}`)}
```

### Event Detail Page (`src/app/events/[id]/page.tsx`)

```typescript
// El componente no requiere cambios
// La API ahora acepta tanto ID como slug automáticamente
```

---

## 🎨 CAMPOS CON NUEVOS COLORES

### Formulario de Creación de Eventos

```typescript
// Todos los inputs ahora tienen:
className="bg-white dark:bg-gray-800 
           border-gray-300 dark:border-gray-600 
           text-gray-900 dark:text-gray-100"
```

### Filtros de Búsqueda

```typescript
// Input de búsqueda y selects con colores actualizados
className="border-2 border-gray-300 dark:border-gray-600 
           bg-white dark:bg-gray-800 
           text-gray-900 dark:text-gray-100"
```

---

## 🚀 BENEFICIOS

### URLs Amigables

1. **SEO Mejorado**: Google prefiere URLs descriptivas
2. **Compartir más fácil**: `ticketwise.com/events/unidafest-2025` es más legible
3. **Memorable**: Los usuarios pueden recordar y escribir la URL
4. **Profesional**: Se ve más limpio que UUIDs largos

### Carpeta Organizada

1. **Separación clara**: Perfiles de eventos vs otras imágenes
2. **Backup más fácil**: Sabes qué carpeta respaldar
3. **Limpieza**: Borrar imágenes de eventos eliminados es más simple

### Colores Actualizados

1. **Mejor legibilidad**: Contraste adecuado entre fondo y texto
2. **Consistencia**: Todos los formularios con el mismo estilo
3. **Accesibilidad**: Cumple con estándares WCAG
4. **Dark mode**: Funciona perfectamente en ambos modos

---

## 🔒 COMPATIBILIDAD HACIA ATRÁS

El sistema **mantiene compatibilidad** con URLs antiguas:

```
✅ /events/550e8400-e29b-41d4-a716-446655440000  (UUID - sigue funcionando)
✅ /events/unidafest-2025                         (Slug - nueva forma)
```

**No necesitas actualizar enlaces existentes**, ambos formatos funcionan.

---

## 🐛 SOLUCIÓN DE PROBLEMAS

### Error: "Evento no encontrado"

**Causa**: El evento no tiene slug generado.

**Solución**: Ejecuta el script SQL para generar slugs.

### Error: "Duplicate key value violates unique constraint"

**Causa**: Ya existe un evento con ese slug.

**Solución**: El sistema agrega automáticamente `-2`, `-3`, etc.

### Imágenes no se muestran

**Causa**: La carpeta `events_profile` no existe.

**Solución**: Crea la carpeta manualmente:
```bash
mkdir uploads/events_profile
```

---

## 📝 ARCHIVOS MODIFICADOS

```
✅ src/lib/slug-utils.ts (NUEVO)
✅ src/app/api/events/route.ts
✅ src/app/api/events/[id]/route.ts
✅ src/app/api/upload-event-image/route.ts
✅ src/app/page.tsx
✅ src/app/dashboard/admin/events/page.tsx
✅ src/app/dashboard/admin/events/new/page.tsx
✅ docs/add-slug-column.sql (NUEVO)
✅ uploads/events_profile/ (NUEVA CARPETA)
```

---

## ✅ CHECKLIST DE IMPLEMENTACIÓN

- [ ] Ejecutar script SQL `add-slug-column.sql`
- [ ] Verificar que columna `slug` existe en tabla `events`
- [ ] Crear carpeta `uploads/events_profile`
- [ ] Reiniciar servidor de desarrollo
- [ ] Crear un evento de prueba
- [ ] Verificar que se genera el slug automáticamente
- [ ] Probar acceder al evento por slug: `/events/nombre-evento`
- [ ] Probar que campos tienen fondos blancos
- [ ] Verificar que imagen se guarda en carpeta correcta

---

**¿Necesitas ayuda con alguno de estos pasos?** 🚀
