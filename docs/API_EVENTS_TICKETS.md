# API de Eventos y Tipos de Entrada - TicketWise

## 📋 Tabla de Contenidos
- [APIs de Eventos](#apis-de-eventos)
- [APIs de Tipos de Entrada](#apis-de-tipos-de-entrada)
- [APIs de Organizadores](#apis-de-organizadores)
- [Ejemplos de Uso](#ejemplos-de-uso)

---

## 🎫 APIs de Eventos

### GET /api/events
Listar todos los eventos.

**Query Parameters:**
- `status` (opcional): Filtrar por estado (draft, active, completed, cancelled)
- `createdBy` (opcional): Filtrar por creador (user_id)

**Ejemplo:**
```bash
GET http://localhost:9004/api/events?status=active
```

**Respuesta:**
```json
[
  {
    "id": "uuid",
    "name": "Concierto Rock 2025",
    "description": "El mejor concierto del año",
    "event_date": "2025-12-31T20:00:00Z",
    "location": "Estadio Nacional",
    "image_url": "/images/evento.jpg",
    "status": "active",
    "created_by": "user-uuid",
    "created_at": "2025-11-02T00:00:00Z",
    "updated_at": "2025-11-02T00:00:00Z"
  }
]
```

---

### POST /api/events
Crear un nuevo evento.

**Body:**
```json
{
  "name": "Concierto Rock 2025",
  "description": "El mejor concierto del año",
  "event_date": "2025-12-31T20:00:00Z",
  "location": "Estadio Nacional",
  "image_url": "/images/evento.jpg",
  "status": "active",
  "created_by": "user-uuid"
}
```

**Campos requeridos:** `name`, `event_date`, `created_by`

**Status válidos:** `draft`, `active`, `completed`, `cancelled`

---

### GET /api/events/[id]
Obtener un evento específico.

**Ejemplo:**
```bash
GET http://localhost:9004/api/events/550e8400-e29b-41d4-a716-446655440000
```

---

### PUT /api/events/[id]
Actualizar un evento.

**Body:**
```json
{
  "name": "Concierto Rock 2025 - ACTUALIZADO",
  "status": "completed"
}
```

**Campos actualizables:** `name`, `description`, `event_date`, `location`, `image_url`, `status`

---

### DELETE /api/events/[id]
Eliminar un evento.

**Nota:** No se puede eliminar si tiene órdenes asociadas.

---

### GET /api/events/[id]/stats
Obtener estadísticas de un evento.

**Respuesta:**
```json
{
  "eventName": "Concierto Rock 2025",
  "ticketTypes": 3,
  "totalOrders": 150,
  "totalRevenue": 45000,
  "pendingOrders": 10,
  "verifiedOrders": 140,
  "ticketsSold": 280,
  "ticketsUsed": 250,
  "totalCapacity": 500
}
```

---

## 🎟️ APIs de Tipos de Entrada

### GET /api/ticket-types
Listar tipos de entrada.

**Query Parameters:**
- `eventId` (opcional): Filtrar por evento

**Ejemplo:**
```bash
GET http://localhost:9004/api/ticket-types?eventId=550e8400-e29b-41d4-a716-446655440000
```

**Respuesta:**
```json
[
  {
    "id": "uuid",
    "event_id": "event-uuid",
    "name": "VIP",
    "description": "Acceso VIP con meet & greet",
    "price": 500.00,
    "quantity_available": 50,
    "created_at": "2025-11-02T00:00:00Z",
    "updated_at": "2025-11-02T00:00:00Z"
  },
  {
    "id": "uuid",
    "event_id": "event-uuid",
    "name": "General",
    "description": "Entrada general",
    "price": 150.00,
    "quantity_available": 450,
    "created_at": "2025-11-02T00:00:00Z",
    "updated_at": "2025-11-02T00:00:00Z"
  }
]
```

---

### POST /api/ticket-types
Crear un nuevo tipo de entrada.

**Body:**
```json
{
  "event_id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "VIP",
  "description": "Acceso VIP con meet & greet",
  "price": 500.00,
  "quantity_available": 50
}
```

**Campos requeridos:** `event_id`, `name`, `price`, `quantity_available`

**Validaciones:**
- `price` >= 0
- `quantity_available` >= 0 (entero)

---

### GET /api/ticket-types/[id]
Obtener un tipo de entrada específico.

---

### PUT /api/ticket-types/[id]
Actualizar un tipo de entrada.

**Body:**
```json
{
  "price": 550.00,
  "quantity_available": 60
}
```

**Campos actualizables:** `name`, `description`, `price`, `quantity_available`

---

### DELETE /api/ticket-types/[id]
Eliminar un tipo de entrada.

**Nota:** No se puede eliminar si tiene órdenes asociadas.

---

## 👥 APIs de Organizadores

### GET /api/events/[id]/organizers
Listar organizadores de un evento.

**Respuesta:**
```json
[
  {
    "user_id": "user-uuid",
    "role": "owner",
    "added_at": "2025-11-02T00:00:00Z",
    "email": "admin@ticketwise.com",
    "display_name": "Admin User"
  }
]
```

---

### POST /api/events/[id]/organizers
Agregar un organizador al evento.

**Body:**
```json
{
  "user_id": "user-uuid",
  "role": "organizer"
}
```

**Roles válidos:** `owner`, `organizer`, `validator`

---

### DELETE /api/events/[id]/organizers?userId=xxx
Eliminar un organizador del evento.

---

## 💡 Ejemplos de Uso

### Flujo completo: Crear evento con tipos de entrada

#### 1. Crear el evento
```bash
POST http://localhost:9004/api/events
Content-Type: application/json

{
  "name": "Festival de Música 2025",
  "description": "3 días de música en vivo",
  "event_date": "2025-07-15T18:00:00Z",
  "location": "Parque Central",
  "status": "active",
  "created_by": "admin-user-uuid"
}
```

Respuesta: `{ "id": "event-123", ... }`

#### 2. Crear tipos de entrada para el evento
```bash
POST http://localhost:9004/api/ticket-types
Content-Type: application/json

{
  "event_id": "event-123",
  "name": "Pase 3 días",
  "description": "Acceso completo a los 3 días",
  "price": 300.00,
  "quantity_available": 1000
}
```

```bash
POST http://localhost:9004/api/ticket-types
Content-Type: application/json

{
  "event_id": "event-123",
  "name": "Día individual",
  "description": "Acceso por 1 día",
  "price": 120.00,
  "quantity_available": 3000
}
```

#### 3. Agregar organizadores
```bash
POST http://localhost:9004/api/events/event-123/organizers
Content-Type: application/json

{
  "user_id": "organizer-user-uuid",
  "role": "organizer"
}
```

#### 4. Ver estadísticas del evento
```bash
GET http://localhost:9004/api/events/event-123/stats
```

---

## 🔐 Autenticación

Todas las APIs requieren autenticación. Incluye el token de usuario en el header o localStorage según el contexto de auth implementado.

---

## ✅ Códigos de Estado HTTP

- `200` - OK
- `201` - Created
- `400` - Bad Request (validación fallida)
- `404` - Not Found
- `409` - Conflict (duplicado)
- `500` - Internal Server Error
