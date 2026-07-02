====================================================================
DOCUMENTO COMPLEMENTARIO: LEAN CANVAS Y PLANES DE PRECIOS
Proyecto: TicketWise - Plataforma de Gestion de Entradas Digitales
Autor: Cesar Ariel Zaracho Gimenez
Tutora: Ing. Lucia Caballero
Materia: Proyecto y Construccion de Sistemas - UNIDA
====================================================================

INDICE:
1. Lean Canvas - Diseno y Contenido Completo
2. Desglose Detallado de Cada Bloque del Lean Canvas
3. Planes de Precios y Estructura de Ingresos
4. Proyeccion Financiera Basica


====================================================================
1. LEAN CANVAS - DISENO COMPLETO
====================================================================

A continuacion se presenta el Lean Canvas de TicketWise en formato
de tabla 3x3, siguiendo la metodologia de Ash Maurya:

+--------------------------+--------------------------+----------------------------+--------------------------+--------------------------+
|       PROBLEMA           |       SOLUCION           |    PROPUESTA DE VALOR      |   VENTAJA COMPETITIVA    |    SEGMENTOS DE          |
|                          |                          |         UNICA              |                          |      CLIENTES            |
+--------------------------+--------------------------+----------------------------+--------------------------+--------------------------+
| - Gestion manual de      | - Plataforma web para    | "Todo-en-uno para          | - Arquitectura full-     | - Organizadores de       |
|   venta de entradas      |   gestion integral de    |   gestionar, vender y      |   stack unificada        |   eventos (B2B)          |
|   (planillas, cuadernos) |   eventos                |   validar entradas de      |   (Next.js 14)           | - Administradores de     |
| - Largas filas en        | - Venta de entradas      |   forma automatica,        | - Codigos QR unicos      |   plataforma             |
|   accesos a eventos      |   online 24/7            |   segura y en tiempo       |   e inalterables por     | - Asistentes/            |
| - Validacion lenta y     | - Validacion digital     |   real, eliminando         |   ticket                 |   compradores (B2C)      |
|   errores en             |   de comprobantes        |   procesos manuales y      | - Roles diferenciados    |                          |
|   comprobantes de pago   |   de pago                |   reduciendo fraudes."     |   (admin/organizador/    |                          |
| - Riesgo de falsificacion| - Generacion de tickets  |                            |   validador/usuario)     |                          |
|   o duplicacion de       |   con codigos QR unicos  |                            | - Diseno responsivo      |                          |
|   entradas               | - Escaneo QR para        |                            |   mobile-first           |                          |
| - Falta de informacion   |   control de acceso      |                            | - Codigo abierto - sin   |                          |
|   en tiempo real         | - Dashboard con          |                            |   costos de licencia     |                          |
|                          |   metricas en tiempo     |                            | - Adaptado al contexto   |                          |
|                          |   real                   |                            |   paraguayo (Gs.,        |                          |
|                          |                          |                            |   Bancos locales)        |                          |
+--------------------------+--------------------------+----------------------------+--------------------------+--------------------------+
|   ALTERNATIVAS           |   METRICAS CLAVE         |                            |   CANALES                |   EARLY ADOPTERS         |
|   EXISTENTES             |                          |                            |                          |                          |
+--------------------------+--------------------------+                            +--------------------------+--------------------------+
| - Planillas de Excel     | - # entradas vendidas    |                            | - Sitio web responsive   | - Eventos academicos     |
| - WhatsApp + listas      |   por evento             |                            | - Redes sociales         |   universitarios         |
|   impresas               | - % de ocupacion del     |                            |   (Instagram, Facebook)  | - Ferias y exposiciones  |
| - Taquilla fisica        |   aforo                  |                            | - Referencia de          |   culturales             |
|   presencial             | - Tiempo de validacion   |                            |   organizadores          | - Eventos de pequena     |
| - Eventbrite (USD,       |   por entrada            |                            | - Demostraciones         |   y mediana escala en    |
|   no local)              | - Ingresos generados     |                            |   presenciales           |   Asuncion               |
| - TuEntrada.com.py       |   por evento             |                            | - Marketing digital      |                          |
|   (solo grandes eventos) | - # organizadores        |                            |                          |                          |
|                          |   activos                |                            |                          |                          |
|                          | - Tasa de conversion     |                            |                          |                          |
|                          |   de compra              |                            |                          |                          |
+--------------------------+--------------------------+----------------------------+--------------------------+--------------------------+
|    ESTRUCTURA DE COSTOS                    |    FLUJOS DE INGRESOS                           |
+--------------------------------------------+-------------------------------------------------+
|  COSTOS FIJOS:                             |  INGRESOS POR COMISION:                         |
|  - Servidor VPS: USD 6/mes                |  - Comision del 5-8% por entrada vendida        |
|  - Dominio web: USD 10/anual              |    (absorbida por el organizador)               |
|  - Certificado SSL: USD 0 (Let's Encrypt) |  - Ejemplo: entrada de Gs. 50.000 =             |
|  - Mantenimiento del sistema:             |    Gs. 2.500-4.000 de comision                  |
|    USD 20/mes                             |                                                 |
|  - Herramientas de desarrollo:            |  PLANES DE SUSCRIPCION MENSUAL:                 |
|    USD 15/mes                             |  - Plan Basico: Gs. 0 (solo comision)           |
|  TOTAL COSTOS FIJOS: ~USD 45/mes          |  - Plan Profesional: Gs. 99.000/mes             |
|                                           |  - Plan Promocion: Gs. 149.000/mes              |
|  COSTOS VARIABLES:                        |                                                 |
|  - Almacenamiento de imagenes/            |  SERVICIOS ADICIONALES:                         |
|    comprobantes: USD 5-15/mes             |  - Publicidad destacada en homepage:            |
|  - Ancho de banda segun trafico:          |    Gs. 50.000 por evento                        |
|    USD 5-20/mes                           |  - Banner en redes sociales de TicketWise:      |
|  - Soporte tecnico bajo demanda:          |    Gs. 75.000 por evento                        |
|    USD 10-30/mes                          |  - Reporte post-evento avanzado:                |
|  - Pasarela de pago (futuro):             |    Gs. 25.000                                   |
|    3-5% por transaccion                   |                                                 |
|  TOTAL COSTOS VARIABLES: ~USD 20-65/mes   |                                                 |
+--------------------------------------------+-------------------------------------------------+


====================================================================
2. DESGLOSE DETALLADO DE CADA BLOQUE
====================================================================

2.1 PROBLEMA (Top 3 Problemas)

Problema 1: Gestion manual ineficiente
- Organizadores usan Excel, cuadernos o listas impresas
- No hay control automatizado de stock de entradas
- Se requiere intervencion humana constante
- Tiempo perdido en tareas repetitivas

Problema 2: Validacion lenta y errores humanos
- Comprobantes de pago se revisan uno por uno
- 5-10% de error en verificacion manual
- Filas de +20 min en accesos para eventos de 500+ personas
- Hasta 3% de entradas falsificadas

Problema 3: Falta de datos en tiempo real
- 80% de organizadores no conserva historial digital
- No hay metricas de ventas, ocupacion ni ingresos
- Decisiones tomadas sin informacion de respaldo


2.2 SEGMENTOS DE CLIENTES

Segmento Principal (B2B): Organizadores de Eventos
- Empresas organizadoras de eventos corporativos
- Instituciones academicas (universidades, colegios)
- Organizadores independientes de eventos culturales
- Asociaciones y gremios que realizan ferias

Segmento Secundario (B2C): Asistentes/Compradores
- Publico general que asiste a eventos
- Estudiantes universitarios
- Profesionales que asisten a conferencias

Usuario Interno: Administradores de Plataforma
- Personal tecnico que gestiona la plataforma
- Validadores que revisan comprobantes y escanean QR


2.3 PROPUESTA DE VALOR UNICA

Frase principal:
"TicketWise es la plataforma web todo-en-uno que permite a
organizadores de eventos en Paraguay gestionar, vender y validar
entradas digitales de forma automatica, segura y en tiempo real,
eliminando procesos manuales y reduciendo fraudes."

Beneficios clave para el organizador:
- Automatiza TODO el ciclo de venta de entradas
- Elimina errores humanos en validacion
- Control de aforo en tiempo real
- Ventas 24/7 sin taquilla fisica
- Datos e informes para tomar decisiones

Beneficios para el asistente:
- Compra rapida desde cualquier dispositivo
- Recibe su ticket QR al instante
- Acceso veloz al evento (solo mostrar QR)


2.4 SOLUCION

Modulo 1: Gestion de Eventos
- CRUD completo de eventos con nombre, descripcion,
  categoria, fecha, ubicacion, imagen y slug

Modulo 2: Tipos de Entrada
- Definir multiples tipos con precio y stock independiente
- Soporte de stock ilimitado para eventos gratuitos

Modulo 3: Venta Online
- Seleccion de tipo y cantidad con verificacion de stock
- Subida de comprobante de pago (JPG/PNG, max 2MB)
- Creacion de ordenes con estado pendiente/aprobado/rechazado

Modulo 4: Validacion de Comprobantes
- Panel con pestanas: pendientes, aprobados, rechazados
- Modal de previsualizacion del comprobante
- Generacion automatica de tickets QR al aprobar

Modulo 5: Tickets QR
- UUID unico de 36 caracteres por ticket
- Codigo QR incrustado en ticket PDF
- Descarga de PDF con diseno profesional

Modulo 6: Escaneo QR
- Lectura mediante camara del dispositivo
- Ingreso manual de UUID alternativo
- Marcado como usado con registro de validador y fecha

Modulo 7: Dashboard
- Metricas globales (admin) y por evento (organizador)
- Graficos de ventas, ingresos y ocupacion
- Panel de validacion (validador)


2.5 VENTAJA COMPETITIVA

1. Adaptacion Local
   - Precios en guaranies
   - Metodos de pago paraguayos (transferencia Banco Familiar)
   - Soporte en espanol contextualizado

2. Arquitectura Moderna
   - Next.js 14, React 18, TypeScript, PostgreSQL
   - QR unicos e inalterables por ticket
   - RBAC con 4 roles diferenciados

3. Modelo Accesible
   - Comisiones bajas (5-8%)
   - Plan gratuito disponible (solo comision)
   - Sin costos de licencia (codigo abierto)

4. Nicho Desatendido
   - Eventos de menos de 1.000 asistentes
   - Ignorado por Eventbrite y TuEntrada.com.py

5. Dificil de Copiar
   - Combina conocimiento del mercado local paraguayo
   - Expertise tecnico en stack moderno


2.6 METRICAS CLAVE

Metricas Operativas:
- Numero de entradas vendidas por evento (diario/semanal)
- Porcentaje de ocupacion del aforo
- Tiempo promedio de validacion por entrada
- Tasa de aprobacion vs rechazo de comprobantes

Metricas Financieras:
- Ingresos generados por evento
- Comisiones cobradas por la plataforma
- Suscripciones activas (Basico/Profesional/Promocion)
- MRR (Monthly Recurring Revenue)

Metricas de Crecimiento:
- Numero de organizadores activos
- Tasa de conversion de compra (visitantes vs compradores)
- Eventos creados por mes
- Tickets emitidos por mes


2.7 CANALES

Canales Digitales:
- Sitio web responsive (canal principal)
- Redes sociales: Instagram y Facebook
- Email marketing para organizadores registrados
- Google Ads y Facebook Ads segmentados

Canales Presenciales:
- Demostraciones en universidades
- Visitas a organizadores de eventos
- Participacion en ferias universitarias y culturales

Canales de Referencia:
- Programa de referidos para organizadores
- Testimonios y casos de exito
- Boca a boca entre organizadores


2.8 EARLY ADOPTERS

Perfil del early adopter:
- Organizador de eventos academicos universitarios
- Realiza 2-6 eventos al ano
- Actualmente usa Excel + WhatsApp
- Eventos de 50 a 500 asistentes
- Presupuesto limitado para tecnologia

Estrategia de captacion:
1. Contactar universidades (UNIDA, UNA, UCA, etc.)
2. Ofrecer periodo gratuito para eventos academicos
3. Asistir a ferias culturales y ofrecer demo en vivo
4. Crear caso de exito con primer evento piloto


2.9 ALTERNATIVAS EXISTENTES

Alternativa 1: Excel + WhatsApp
- Gratuito pero manual y propenso a errores
- No escala, no da metricas, no tiene seguridad
- Mas usado actualmente (70%+ del mercado)

Alternativa 2: Taquilla fisica
- Tradicional, pago en efectivo
- Horarios limitados, filas, sin datos digitales
- Costo de personal para atencion

Alternativa 3: Eventbrite
- Internacional, reconocido
- Precios en USD, pasarelas internacionales
- No adaptado a Paraguay

Alternativa 4: TuEntrada.com.py
- Presencia local
- Solo para eventos masivos
- Comisiones altas para eventos pequenos


====================================================================
3. PLANES DE PRECIOS Y ESTRUCTURA DE INGRESOS
====================================================================

3.1 PLAN BASICO - Freemium (Solo Comision)

Precio: Gs. 0/mes (gratuito)
Objetivo: Captar organizadores y generar traccion inicial

Incluye:
- Creacion de hasta 3 eventos activos simultaneos
- Venta de entradas online
- 3 tipos de entrada por evento
- Generacion de tickets QR
- Validacion de comprobantes
- Escaneo QR en acceso
- Dashboard basico por evento
- Hasta 500 entradas vendidas por evento

Comision:
- 8% del valor de cada entrada vendida
- Comision maxima: Gs. 5.000 por entrada
- Sin cargo para entradas gratuitas

Ejemplo practico:
  Evento con 200 entradas a Gs. 50.000 c/u
  Recaudacion total: Gs. 10.000.000
  Comision 8%: Gs. 800.000
  Ingreso neto organizador: Gs. 9.200.000


3.2 PLAN PROFESIONAL - Suscripcion Mensual

Precio: Gs. 99.000/mes (aproximadamente USD 13)
Objetivo: Organizadores recurrentes con mayor volumen

Incluye:
- Eventos ilimitados simultaneos
- Tipos de entrada ilimitados por evento
- Stock ilimitado por tipo de entrada
- Dashboard avanzado con graficos interactivos
- Reportes descargables en PDF/CSV
- Exportacion de datos de asistentes
- Soporte prioritario via WhatsApp (respuesta < 4h)
- Sin limite de entradas vendidas
- Historial completo de eventos pasados

Comision:
- 5% del valor de cada entrada vendida
- Comision maxima: Gs. 3.000 por entrada

Ejemplo practico:
  Evento con 500 entradas a Gs. 80.000 c/u
  Recaudacion total: Gs. 40.000.000
  Comision 5%: Gs. 2.000.000
  Suscripcion mensual: Gs. 99.000
  Costo total: Gs. 2.099.000
  Ingreso neto organizador: Gs. 37.901.000

Vs. Plan Basico (mismo evento con 8%):
  Comision 8%: Gs. 3.200.000
  Ahorro con Plan Profesional: Gs. 1.101.000


3.3 PLAN PROMOCION - Suscripcion Premium

Precio: Gs. 149.000/mes (aproximadamente USD 20)
Objetivo: Organizadores que buscan maxima visibilidad

Incluye:
- Todo lo del Plan Profesional
- Publicacion destacada en homepage de TicketWise
- Banner promocional en pagina de eventos
- Publicacion en redes sociales de TicketWise
  (1 post + 2 stories por evento)
- Reporte post-evento avanzado con analisis
- Soporte VIP via WhatsApp y llamada
- Acceso anticipado a nuevas funcionalidades

Comision:
- 5% del valor de cada entrada vendida
- Comision maxima: Gs. 3.000 por entrada

Ejemplo practico:
  Evento con 300 entradas a Gs. 100.000 c/u
  Exposicion adicional por promocion en plataforma
  Potencial de venta estimado +15-20% vs sin promocion


3.4 SERVICIOS ADICIONALES (One-time)

- Publicidad destacada en homepage:
  Gs. 50.000 por evento (7 dias visibles)

- Banner rotativo en pagina de eventos:
  Gs. 75.000 por evento (14 dias visibles)

- Campana en redes sociales de TicketWise:
  Gs. 100.000 por evento (incluye diseno grafico)

- Reporte post-evento avanzado personalizado:
  Gs. 35.000

- Capacitacion presencial para el equipo organizador:
  Gs. 100.000 (sesion de 2 horas)

- Integracion con sistema de facturacion electronica DNIT:
  Gs. 200.000 (configuracion inicial unica)


====================================================================
4. PROYECCION FINANCIERA BASICA
====================================================================

4.1 PROYECCION MENSUAL (ESCALONADA)

Mes 1-3 (Lanzamiento):
  Organizadores activos: 3-5 (todos Plan Basico)
  Eventos por mes: 3-6
  Entradas vendidas: 150-300
  Ingreso por comisiones: Gs. 300.000 - 1.200.000
  Suscripciones: Gs. 0
  Ingreso total: ~Gs. 600.000/mes
  Costos operativos: ~Gs. 135.000/mes (USD 45)
  Resultado: Gs. +465.000/mes

Mes 4-6 (Crecimiento inicial):
  Organizadores activos: 8-12
  - 6 Plan Basico, 3 Profesional, 1 Promocion
  Eventos por mes: 10-15
  Entradas vendidas: 500-1.000
  Ingreso por comisiones: Gs. 2.000.000 - 4.000.000
  Suscripciones: 3x99.000 + 1x149.000 = Gs. 446.000
  Ingreso total: ~Gs. 3.500.000/mes
  Costos operativos: ~Gs. 350.000/mes
  Resultado: Gs. +3.150.000/mes

Mes 7-12 (Consolidacion):
  Organizadores activos: 20-30
  - 12 Plan Basico, 10 Profesional, 4 Promocion
  Eventos por mes: 25-40
  Entradas vendidas: 2.000-5.000
  Ingreso por comisiones: Gs. 8.000.000 - 12.000.000
  Suscripciones: 10x99.000 + 4x149.000 = Gs. 1.586.000
  Ingreso total: ~Gs. 11.000.000/mes
  Costos operativos: ~Gs. 600.000/mes
  Resultado: Gs. +10.400.000/mes


4.2 PUNTO DE EQUILIBRIO (BREAK-EVEN)

Costos fijos mensuales: ~Gs. 135.000 (USD 45)
Comision promedio por entrada: Gs. 3.000 (estimado)

Entradas necesarias para break-even:
  135.000 / 3.000 = 45 entradas/mes

Con el Plan Profesional (Gs. 99.000/mes):
  Se necesitan 1-2 suscripciones para cubrir costos fijos

Conclusion: El modelo es viable desde el primer mes incluso
con volumenes minimos de operacion.


4.3 INDICADORES CLAVE DE RENTABILIDAD

MRR (Monthly Recurring Revenue) objetivo:
  Mes 6: Gs. 3.500.000
  Mes 12: Gs. 11.000.000
  Mes 18: Gs. 25.000.000 (con 60+ organizadores activos)

CAC (Costo de Adquisicion de Cliente):
  Marketing digital: ~Gs. 50.000 por organizador
  Demostraciones presenciales: ~Gs. 30.000 por organizador
  Referidos: Gs. 0 (costo solo del incentivo)

LTV (Lifetime Value) estimado:
  Organizador promedio: 6-12 meses activo
  Plan Basico: Gs. 250.000 - 1.200.000 en comisiones
  Plan Profesional: Gs. 594.000 + comisiones
  LTV promedio ponderado: ~Gs. 1.500.000


====================================================================
Nota: Todos los precios estan expresados en guaranies (Gs.)
con referencia aproximada en USD (1 USD ≈ Gs. 7.500).
Los valores son estimaciones basadas en el analisis del mercado
de eventos en Asuncion, Paraguay, 2026.

Elaboracion propia basada en la metodologia Lean Canvas de Ash Maurya.
====================================================================
