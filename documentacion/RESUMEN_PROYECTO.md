# RESUMEN EJECUTIVO - TICKETWISE

## 📋 Datos Generales
- **Proyecto:** TicketWise - Plataforma de Gestión de Entradas Digitales
- **Autor:** Cesar Ariel Zaracho Gimenez
- **Tutora:** Ing. Lucia Caballero
- **Carrera:** Ingeniería en Sistemas - UNIDA
- **Materia:** Proyecto y Construcción de Sistemas
- **Año:** 2026

---

## 🎯 Problema
En Paraguay, más del **70%** de los eventos pequeños y medianos gestionan entradas de forma manual (Excel, WhatsApp, listas impresas). Esto genera:
- Filas de **+20 min** en accesos (eventos de 500+ personas)
- **5-10%** de error en verificación manual
- Hasta **3%** de entradas falsificadas
- **80%** sin historial digital de ventas
- Pérdidas económicas del **5-8%** de ingresos por evento

## 💡 Solución
Plataforma web **todo-en-uno** que automatiza: creación de eventos → venta online → validación de pagos → generación de tickets QR → control de accesos → estadísticas en tiempo real.

## 🏗️ Stack Tecnológico
| Capa | Tecnologías |
|------|-------------|
| Frontend | Next.js 14, React 18, TypeScript, TailwindCSS, shadcn/ui |
| Backend | API Routes (Next.js), JWT, bcryptjs, Zod |
| Base de Datos | PostgreSQL |
| Infraestructura | Docker, Nginx, Prometheus, Grafana |

## 👥 Roles de Usuario
| Rol | Función |
|-----|---------|
| **Administrador** | Gestiona plataforma, usuarios y configuración |
| **Organizador** | Crea eventos, define precios y controla ventas |
| **Validador** | Revisa comprobantes y escanea QR en accesos |
| **Usuario/Cliente** | Compra entradas y descarga tickets PDF |

## 📦 8 Módulos Funcionales
1. Autenticación y Usuarios (JWT + roles)
2. Gestión de Eventos (CRUD completo)
3. Tipos de Entrada (precio/stock por tipo)
4. Compra de Entradas (selección + comprobante)
5. Validación de Comprobantes (aprobación/rechazo)
6. Generación de Tickets QR (UUID único + PDF)
7. Escaneo QR para Acceso (cámara + verificación)
8. Dashboard y Estadísticas (métricas en tiempo real)

## 💰 Modelo de Negocio
**Híbrido:** Plataforma digital + comisión por transacción + suscripción
- **B2B:** Organizadores pagan por el servicio
- **B2C:** Asistentes compran entradas
- **Planes:** Básico (comisión), Profesional (estadísticas + soporte), Promoción (publicidad)

## 📐 Lean Canvas (9 bloques)
| Problema | Solución | Propuesta de Valor | Ventaja Competitiva | Segmentos |
|----------|----------|-------------------|-------------------|-----------|
| Gestión manual | Plataforma web | "Todo-en-uno para gestionar, vender y validar entradas" | Next.js + QR únicos + roles + mobile-first + código abierto + contexto PY | Organizadores (B2B), Asistentes (B2C) |
| Filas largas | Venta 24/7 | | | |
| Validación lenta | Validación digital | | | |
| Falsificación | Tickets QR | | | |
| Sin datos | Dashboard tiempo real | | | |

| Alternativas | Métricas Clave | Canales | Early Adopters |
|-------------|---------------|---------|---------------|
| Excel, WhatsApp, Taquilla física | # entradas vendidas, % ocupación, tiempo validación, ingresos | Sitio web, redes sociales, referencias, marketing digital | Eventos académicos, ferias culturales, eventos PY |

| Costos | Ingresos |
|--------|----------|
| Fijos: VPS (USD 6/mes), dominio, mantenimiento | Comisión por entrada |
| Variables: almacenamiento, ancho de banda, soporte | Planes Básico/Profesional/Promoción |

## 🔒 Seguridad
- JWT con refresh tokens + cookies httpOnly
- RBAC (control de acceso por roles)
- Consultas parametrizadas (anti SQL injection)
- bcryptjs (10 rondas de hash)
- Headers HTTP de seguridad (CSP, X-Frame-Options, etc.)

## 📊 Cronograma (24 semanas)
Fase 1: Análisis (Sem 1-3) → Fase 2: Diseño (Sem 4-6) → Fase 3: Backend (Sem 7-11) → Fase 4: Frontend (Sem 12-16) → Fase 5: Integración (Sem 17-20) → Fase 6: Despliegue (Sem 21-22) → Fase 7: Cierre (Sem 23-24)
