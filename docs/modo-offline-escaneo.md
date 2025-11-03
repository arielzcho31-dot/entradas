# 📱 SISTEMA DE ESCANEO OFFLINE CON SINCRONIZACIÓN

## 🎯 ¿Qué es el Modo Offline?

El **modo offline** permite a los validadores escanear entradas **sin conexión a internet**, almacenando los datos localmente en el navegador y sincronizándolos automáticamente cuando se recupere la conexión.

---

## 🔧 ¿Cómo Funciona?

### 1. **Almacenamiento Local (IndexedDB)**
```
Cuando NO hay internet:
Usuario escanea QR → Datos se guardan en IndexedDB del navegador
```

**IndexedDB** es una base de datos del navegador que persiste incluso si cierras la pestaña. Es como un "mini-servidor" dentro del navegador.

### 2. **Sincronización Automática**
```
Cuando se recupera internet:
IndexedDB → Envía todos los escaneos pendientes → Servidor PostgreSQL
```

El sistema detecta automáticamente cuando hay conexión y envía todos los escaneos acumulados.

### 3. **Validación Instantánea**
```
Offline:  Escaneo QR → Verifica en cache local → Marca como usado
Online:   Escaneo QR → Verifica en servidor → Marca como usado
```

---

## 💡 Ejemplo Práctico

### Escenario: Evento en un campo deportivo con mala señal

**ANTES del evento (CON internet):**
1. El validador abre el scanner
2. El sistema descarga todos los tickets válidos del evento
3. Se almacenan en IndexedDB (cache local)

**DURANTE el evento (SIN internet):**
1. Llega un asistente con su QR
2. El validador escanea el código
3. El sistema busca en IndexedDB:
   - ✅ Si existe y no está usado → Lo marca como usado en IndexedDB
   - ❌ Si ya fue usado → Muestra "Ya fue escaneado"
   - ❌ Si no existe → Muestra "Ticket inválido"

**DESPUÉS del escaneo (cuando vuelve internet):**
1. El sistema detecta conexión
2. Envía todos los escaneos a la base de datos central
3. Limpia IndexedDB

---

## 📊 Ventajas del Sistema Offline

| Ventaja | Descripción |
|---------|-------------|
| **Sin interrupciones** | Funciona aunque se caiga el internet del lugar |
| **Velocidad** | No espera respuesta del servidor (instantáneo) |
| **Escalabilidad** | Múltiples validadores sin sobrecargar el servidor |
| **Confiabilidad** | Los datos no se pierden, se sincronizan cuando hay conexión |

---

## 🛠️ Implementación Técnica

### Estructura de Datos en IndexedDB

```javascript
// Base de datos: TicketWiseDB
// Store: pendingScans

{
  id: "scan_123456",
  ticketId: "abc-123-def-456",
  eventId: "event_001",
  scannedAt: "2025-11-02T14:30:00Z",
  validatorId: "user_validator_01",
  status: "pending", // "pending" | "synced" | "error"
  ticketData: {
    userName: "Juan Pérez",
    ticketType: "General",
    eventName: "UnidaFest 2025"
  }
}
```

### Flujo de Sincronización

```javascript
// 1. Detectar conexión
window.addEventListener('online', () => {
  syncPendingScans();
});

// 2. Sincronizar
async function syncPendingScans() {
  const pendingScans = await db.pendingScans.where('status').equals('pending').toArray();
  
  for (const scan of pendingScans) {
    try {
      await fetch('/api/tickets/mark-used', {
        method: 'POST',
        body: JSON.stringify(scan)
      });
      
      // Marcar como sincronizado
      await db.pendingScans.update(scan.id, { status: 'synced' });
    } catch (error) {
      // Marcar como error y reintentar después
      await db.pendingScans.update(scan.id, { status: 'error' });
    }
  }
}
```

---

## 🎮 Interfaz de Usuario

### Indicadores Visuales

```
🟢 Online   → "Conectado - Sincronizando en tiempo real"
🔴 Offline  → "Sin conexión - Escaneos guardados localmente"
🟡 Syncing  → "Sincronizando... (3 pendientes)"
```

### Panel de Estadísticas Offline

```
┌────────────────────────────────────┐
│ MODO OFFLINE ACTIVO                │
├────────────────────────────────────┤
│ ✅ Escaneos locales: 47            │
│ ⏳ Pendientes de sincronizar: 0    │
│ 📊 Cache: 250 tickets cargados     │
│                                    │
│ [🔄 Forzar Sincronización]        │
└────────────────────────────────────┘
```

---

## ⚙️ Configuración Recomendada

### Pre-carga de Tickets

```javascript
// Descargar todos los tickets ANTES del evento
async function preloadEventTickets(eventId) {
  const response = await fetch(`/api/events/${eventId}/tickets`);
  const tickets = await response.json();
  
  // Guardar en IndexedDB
  await db.tickets.bulkPut(tickets);
  
  console.log(`✅ ${tickets.length} tickets pre-cargados`);
}
```

### Limpieza Automática

```javascript
// Limpiar tickets de eventos pasados
async function cleanOldCache() {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  
  await db.tickets
    .where('eventDate')
    .below(yesterday.toISOString())
    .delete();
}
```

---

## 🚨 Manejo de Conflictos

### ¿Qué pasa si dos validadores escanean el mismo ticket offline?

**Problema:**
- Validador A (sin internet): Escanea ticket #123 → Guarda en local
- Validador B (sin internet): Escanea ticket #123 → Guarda en local
- Ambos recuperan conexión y sincronizan

**Solución:**
```javascript
// El servidor valida con timestamp
// El que llegó primero al servidor gana
// El segundo recibe: "Ticket ya usado a las 14:32 por Validador A"
```

### Sistema de Resolución

```javascript
{
  ticketId: "123",
  scannedByOffline: "Validador A",
  scannedAtOffline: "14:30:00",
  syncedAt: "14:35:00",
  status: "accepted" // o "rejected_duplicate"
}
```

---

## 📈 Estadísticas de Escaneo Masivo

### Dashboard de Validación

```
┌─────────────────────────────────────────┐
│ ESTADÍSTICAS DEL EVENTO                 │
├─────────────────────────────────────────┤
│ Total tickets vendidos: 500             │
│ Tickets escaneados: 347 (69%)           │
│ Pendientes: 153                         │
│                                         │
│ 📊 Hora pico: 20:00 - 21:00 (120 scans)│
│ ⚡ Promedio: 2.3 scans/minuto          │
│ 🚨 Duplicados detectados: 2             │
└─────────────────────────────────────────┘
```

### Gráfico de Entrada en Tiempo Real

```
21:00 ████████████████████ 120
20:30 ██████████████████ 95
20:00 ████████████ 67
19:30 ████████ 45
19:00 ████ 20
```

---

## 🔐 Seguridad Offline

### Validaciones Locales

```javascript
// Verificar firma del QR
function verifyQRSignature(qrData, signature) {
  const publicKey = getServerPublicKey();
  return crypto.subtle.verify(
    {name: "RSASSA-PKCS1-v1_5"},
    publicKey,
    signature,
    qrData
  );
}
```

### Prevención de Fraudes

- ✅ QR codes firmados criptográficamente
- ✅ Tokens de un solo uso (nonce)
- ✅ Timestamp validation
- ✅ Verificación de evento correcto

---

## 🎯 Roadmap Futuro

### Funcionalidades Avanzadas

1. **Sincronización P2P**
   ```
   Si hay varios validadores offline, uno con internet puede
   ser el "hub" y sincronizar para todos
   ```

2. **Modo Super-Offline**
   ```
   Pre-cargar TODOS los datos del evento:
   - Lista de tickets
   - Fotos de compradores
   - Datos de emergencia
   ```

3. **Analytics Offline**
   ```
   Generar reportes locales sin necesidad de servidor:
   - Entradas por hora
   - Tipos de ticket más vendidos
   - Tiempo promedio de escaneo
   ```

---

## 📱 Soporte de Dispositivos

| Dispositivo | IndexedDB | Service Workers | Soporte |
|-------------|-----------|-----------------|---------|
| Chrome (Desktop) | ✅ | ✅ | 100% |
| Chrome (Android) | ✅ | ✅ | 100% |
| Firefox | ✅ | ✅ | 100% |
| Safari (iOS) | ✅ | ⚠️ | 95% |
| Edge | ✅ | ✅ | 100% |

---

## 💻 Ejemplo de Código Completo

```typescript
// 1. Configurar IndexedDB
import Dexie, { Table } from 'dexie';

interface Ticket {
  id: string;
  eventId: string;
  userName: string;
  used: boolean;
}

class TicketWiseDB extends Dexie {
  tickets!: Table<Ticket>;
  
  constructor() {
    super('TicketWiseDB');
    this.version(1).stores({
      tickets: 'id, eventId, used'
    });
  }
}

const db = new TicketWiseDB();

// 2. Escanear offline
async function scanTicketOffline(ticketId: string) {
  // Buscar en cache local
  const ticket = await db.tickets.get(ticketId);
  
  if (!ticket) {
    return { success: false, message: 'Ticket inválido' };
  }
  
  if (ticket.used) {
    return { success: false, message: 'Ticket ya usado' };
  }
  
  // Marcar como usado localmente
  await db.tickets.update(ticketId, { used: true });
  
  // Guardar para sincronizar después
  await savePendingSync(ticketId);
  
  return { success: true, message: 'Ticket válido' };
}

// 3. Sincronizar cuando hay internet
window.addEventListener('online', async () => {
  const pending = await getPendingScans();
  
  for (const scan of pending) {
    try {
      await fetch('/api/tickets/sync', {
        method: 'POST',
        body: JSON.stringify(scan)
      });
      
      await markAsSynced(scan.id);
    } catch (error) {
      console.error('Error syncing:', error);
    }
  }
});
```

---

## 🎓 Conclusión

El **modo offline** es esencial para eventos masivos donde:
- La señal de internet puede ser inestable
- Hay múltiples puntos de entrada
- Se requiere velocidad de procesamiento
- No se puede tolerar caídas del sistema

**El sistema garantiza que ningún escaneo se pierda, incluso sin conexión a internet.**

---

¿Necesitas ayuda implementando alguna de estas funcionalidades? ¡Avísame!
