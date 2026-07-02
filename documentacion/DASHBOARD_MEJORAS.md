# 🎯 PLAN DE MEJORAS PARA DASHBOARDS

## 📊 ESTADO ACTUAL DE DASHBOARDS POR ROL

### 🔴 **ADMIN** (`/dashboard/admin`)
**Funcionalidades Actuales:**
- ✅ Ver estadísticas generales (usuarios, entradas, ingresos)
- ✅ Gestionar usuarios (crear, editar, eliminar, cambiar roles)
- ✅ Ver todas las entradas del sistema
- ✅ Filtrar usuarios por rol
- ✅ Buscar usuarios por email

**❌ FALTA CREAR:**
1. **Gestión de Eventos** (CRÍTICO)
   - Crear nuevos eventos
   - Editar eventos existentes
   - Ver lista de todos los eventos
   - Cambiar estado (activo/finalizado/cancelado)
   - Eliminar eventos
   - Subir imagen del evento

2. **Gestión de Tipos de Entrada por Evento**
   - Crear tipos de entrada (General, VIP, Estudiante, etc.)
   - Definir precios por tipo
   - Establecer cantidad disponible
   - Activar/desactivar tipos de entrada

3. **Dashboard de Reportes**
   - Gráficos de ventas por evento
   - Ingresos totales por evento
   - Entradas vendidas vs disponibles
   - Exportar reportes a Excel/PDF

---

### 🟡 **VALIDATOR** (`/dashboard/validator`)
**Funcionalidades Actuales:**
- ✅ Ver órdenes pendientes de verificación
- ✅ Aprobar órdenes (crea tickets automáticamente)
- ✅ Rechazar órdenes
- ✅ Ver comprobantes de pago
- ✅ Filtrar por nombre de usuario

**✅ MEJORAS SUGERIDAS:**
1. **Historial de Validaciones**
   - Ver órdenes aprobadas/rechazadas históricamente
   - Filtro por fecha
   - Estadísticas de validación (aprobadas vs rechazadas)

2. **Notas/Comentarios**
   - Agregar comentarios al aprobar/rechazar
   - Ver historial de cambios de estado

3. **Vista Previa Mejorada del Comprobante**
   - ✅ Ya implementado (modal con imagen)

---

### 🟢 **ORGANIZER** (`/dashboard/organizer`)
**Funcionalidades Actuales:**
- ✅ Ver sus propios eventos creados
- ✅ Ver estadísticas de sus eventos

**✅ MEJORAS SUGERIDAS:**
1. **Gestión Completa de Sus Eventos**
   - Crear nuevos eventos (similar a admin pero solo suyos)
   - Editar sus eventos
   - Gestionar tipos de entrada de sus eventos
   - Ver ventas en tiempo real

2. **Códigos de Descuento**
   - Crear códigos promocionales
   - Definir porcentaje/monto de descuento
   - Establecer límites de uso

3. **Comunicación con Compradores**
   - Enviar emails masivos a compradores de un evento
   - Notificaciones de cambios en el evento

---

### 🔵 **USER/CUSTOMER** (`/dashboard/my-tickets`)
**Funcionalidades Actuales:**
- ✅ Ver órdenes pendientes/aprobadas/rechazadas
- ✅ Ver comprobante subido
- ✅ Ver entradas verificadas con QR
- ✅ Descargar entradas en PDF

**✅ MEJORAS SUGERIDAS:**
1. **Historial Completo**
   - Ver todas las compras históricas
   - Filtrar por estado/fecha

2. **Compartir Entradas**
   - Transferir entrada a otro usuario
   - Enviar entrada por WhatsApp/Email

3. **Favoritos**
   - Guardar eventos favoritos
   - Recibir notificaciones de nuevos eventos similares

---

### 🟣 **SCAN** (`/dashboard/scan`)
**Funcionalidades Actuales:**
- ✅ Escanear códigos QR
- ✅ Validar entradas
- ✅ Marcar como "usada"

**✅ MEJORAS SUGERIDAS:**
1. **Escaneo Masivo**
   - Escanear múltiples entradas rápidamente
   - Modo offline con sincronización

2. **Estadísticas de Escaneo**
   - Cantidad de entradas escaneadas
   - Hora pico de entrada
   - Alertas de entradas duplicadas

---

## 🎨 IMPLEMENTACIÓN PRIORITARIA: GESTIÓN DE EVENTOS

### 📋 Componente: Event Management Dashboard

**Ubicación:** `/dashboard/admin/events` (nueva página)

**Funcionalidades:**

#### 1. **Lista de Eventos**
```tsx
- Tabla con todos los eventos
- Columnas: Nombre | Fecha | Ubicación | Estado | Ventas | Acciones
- Filtros: Estado (activo/finalizado/cancelado), Fecha
- Búsqueda por nombre
```

#### 2. **Crear Evento (Modal/Formulario)**
```tsx
Campos:
- Nombre del evento *
- Descripción
- Fecha y hora *
- Ubicación *
- Imagen del evento (upload)
- Estado (draft/active/completed/cancelled)
- Organizador (seleccionar usuario)

Botón: "Crear Evento"
```

#### 3. **Editar Evento**
```tsx
- Mismo formulario pero pre-llenado
- Botón "Actualizar Evento"
```

#### 4. **Gestión de Tipos de Entrada**
```tsx
Por cada evento:
- Agregar tipo de entrada
  - Nombre (General, VIP, Estudiante)
  - Precio (Gs.)
  - Cantidad disponible (opcional, null = ilimitado)
  - Descripción
- Editar tipos existentes
- Eliminar tipos
```

#### 5. **Vista Detallada del Evento**
```tsx
- Información completa del evento
- Estadísticas:
  - Total vendido
  - Ingresos generados
  - Entradas disponibles por tipo
- Gráfico de ventas
- Lista de compradores
```

---

## 🚀 FLUJO DE CREACIÓN DE EVENTO (PASO A PASO)

### **Como Admin:**

1. **Ir a Dashboard Admin**
   - URL: `/dashboard/admin`

2. **Click en "Gestión de Eventos"** (nuevo tab/sección)
   - Se muestra lista de eventos existentes

3. **Click en "Crear Nuevo Evento"**
   - Se abre modal/formulario

4. **Completar Datos del Evento:**
   ```
   ┌─────────────────────────────────────────┐
   │ Crear Nuevo Evento                      │
   ├─────────────────────────────────────────┤
   │ Nombre: [UNIDAFEST 2025              ] │
   │ Descripción: [Festival universitario  ] │
   │ Fecha: [2025-12-15] Hora: [20:00]      │
   │ Ubicación: [Auditorio Central        ] │
   │ Estado: [Activo ▼]                      │
   │ Imagen: [Subir Imagen]                  │
   │                                         │
   │ [Cancelar]  [Crear Evento]             │
   └─────────────────────────────────────────┘
   ```

5. **Click en "Crear Evento"**
   - Se crea el evento en la BD
   - Se redirige a "Gestión de Tipos de Entrada"

6. **Agregar Tipos de Entrada:**
   ```
   ┌─────────────────────────────────────────┐
   │ Tipos de Entrada - UNIDAFEST 2025      │
   ├─────────────────────────────────────────┤
   │ [+ Agregar Tipo de Entrada]             │
   │                                         │
   │ ┌─────────────────────────────────────┐ │
   │ │ General                             │ │
   │ │ Precio: Gs. 35,000                  │ │
   │ │ Disponibles: 500                    │ │
   │ │ [Editar] [Eliminar]                 │ │
   │ └─────────────────────────────────────┘ │
   │                                         │
   │ ┌─────────────────────────────────────┐ │
   │ │ VIP                                 │ │
   │ │ Precio: Gs. 80,000                  │ │
   │ │ Disponibles: 100                    │ │
   │ │ [Editar] [Eliminar]                 │ │
   │ └─────────────────────────────────────┘ │
   └─────────────────────────────────────────┘
   ```

7. **Evento Creado y Listo**
   - Ahora aparece en `/api/events`
   - Los usuarios pueden comprarlo en `/events/{uuid}`

---

## 📂 ESTRUCTURA DE ARCHIVOS PROPUESTA

```
src/app/dashboard/admin/
├── page.tsx                    (Dashboard principal con stats)
├── events/
│   ├── page.tsx               (Lista de eventos)
│   ├── [id]/
│   │   ├── page.tsx          (Detalle/editar evento)
│   │   └── ticket-types/
│   │       └── page.tsx      (Gestión de tipos de entrada)
│   └── new/
│       └── page.tsx          (Crear nuevo evento)
└── reports/
    └── page.tsx              (Reportes y gráficos)
```

---

## 🛠️ APIS YA DISPONIBLES

✅ Ya existen estas APIs (creadas en la migración):

### Eventos:
- `POST /api/events` - Crear evento
- `GET /api/events` - Listar eventos
- `GET /api/events/:id` - Ver un evento
- `PUT /api/events/:id` - Actualizar evento
- `DELETE /api/events/:id` - Eliminar evento
- `GET /api/events/:id/stats` - Estadísticas del evento

### Tipos de Entrada:
- `POST /api/ticket-types` - Crear tipo
- `GET /api/ticket-types?eventId=xxx` - Listar por evento
- `PUT /api/ticket-types/:id` - Actualizar tipo
- `DELETE /api/ticket-types/:id` - Eliminar tipo

**✅ Solo falta crear las interfaces de usuario (componentes React)**

---

## 📌 RESUMEN DE PRIORIDADES

### 🔥 **URGENTE** (Implementar ya):
1. ✅ Gestión de Eventos en Admin Dashboard
2. ✅ Gestión de Tipos de Entrada
3. ✅ Formulario de Creación de Eventos

### 🚀 **IMPORTANTE** (Siguiente fase):
1. Dashboard de Reportes con Gráficos
2. Historial de Validaciones (Validator)
3. Gestión de Eventos para Organizers

### 💡 **NICE TO HAVE** (Futuro):
1. Códigos de Descuento
2. Transferencia de Entradas
3. Notificaciones Push
4. Chat de Soporte

---

## 🎨 MOCKUP BÁSICO - ADMIN DASHBOARD MEJORADO

```
┌──────────────────────────────────────────────────────────────┐
│ Admin Dashboard                                    [Usuario ▼]│
├──────────────────────────────────────────────────────────────┤
│ [Dashboard] [Eventos] [Usuarios] [Reportes] [Configuración] │
├──────────────────────────────────────────────────────────────┤
│                                                                │
│ 📊 ESTADÍSTICAS                                               │
│ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐         │
│ │ Usuarios │ │ Eventos  │ │ Ventas   │ │ Ingresos │         │
│ │   125    │ │    8     │ │  1,234   │ │ Gs. 45M  │         │
│ └──────────┘ └──────────┘ └──────────┘ └──────────┘         │
│                                                                │
│ 🎭 EVENTOS                              [+ Crear Evento]      │
│ ┌────────────────────────────────────────────────────────────┐│
│ │ Nombre       │ Fecha      │ Estado   │ Vendidas │ Acciones││
│ ├────────────────────────────────────────────────────────────┤│
│ │ UNIDAFEST    │ 2025-12-15 │ 🟢 Activo│ 450/600  │ [Ver]   ││
│ │ Rock Fest    │ 2025-11-20 │ 🟡 Draft │ 0/500    │ [Editar]││
│ │ Expo Tech    │ 2025-10-05 │ 🔴 Fin   │ 300/300  │ [Ver]   ││
│ └────────────────────────────────────────────────────────────┘│
│                                                                │
│ 👥 USUARIOS RECIENTES                                         │
│ [...]                                                          │
└──────────────────────────────────────────────────────────────┘
```

---

¿Querés que implemente la gestión de eventos en el dashboard de admin ahora?
