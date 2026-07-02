====================================================================
GUION DE EXPOSICION - TICKETWISE
Proyecto: Diseno e Implementacion de una Plataforma Web para la
Gestion, Comercializacion y Validacion de Entradas Digitales
Autor: Cesar Ariel Zaracho Gimenez
Catedra: Proyecto y Construccion de Sistemas - UNIDA
Duracion estimada: 10 minutos
====================================================================


====================================================================
DIAPOSITIVA 1 - PORTADA (30 segundos)
====================================================================

QUE DECIR:
"Buenos dias/tardes. Mi nombre es Cesar Ariel Zaracho Gimenez,
y hoy voy a presentar mi proyecto de tesis titulado:

'Diseno e Implementacion de una Plataforma Web para la Gestion,
Comercializacion y Validacion de Entradas Digitales',
bajo el nombre comercial de TicketWise.

Este proyecto fue desarrollado para la catedra de Proyecto y
Construccion de Sistemas, de la Facultad de Ingenieria de la
UNIDA, bajo la tutoria de la Ingeniera Lucia Caballero."


====================================================================
DIAPOSITIVA 2 - AGENDA (30 segundos)
====================================================================

QUE DECIR:
"La presentacion esta organizada en 10 bloques:

Primero, vamos a ver el problema que detectamos en el mercado
de eventos en Paraguay. Luego, la justificacion y los objetivos
del proyecto. Despues, la solucion propuesta con los procesos
actual y mejorado. Seguimos con los diagramas tecnicos: contexto,
modelo de datos y casos de uso. Y finalizamos con el modelo de
negocio, el lean canvas, las tecnologias utilizadas y las
conclusiones.

Vamos a empezar."


====================================================================
DIAPOSITIVA 3 - PROBLEMA CUANTIFICADO (1 minuto)
====================================================================

QUE DECIR:
"El problema que motiva este proyecto es la gestion manual de
entradas para eventos en Paraguay.

Los datos que relevamos muestran que mas del 70% de los eventos
pequenos y medianos, con menos de 1.000 asistentes, todavia
gestionan sus entradas con metodos manuales: planillas de Excel,
WhatsApp y listas impresas.

Esto genera consecuencias concretas:
- Un 5 a 10 por ciento de error en la verificacion manual de
  entradas en los accesos.
- Filas de mas de 20 minutos en eventos de 500 personas.
- Hasta un 3% de entradas falsificadas por falta de mecanismos
  de validacion unicos.
- Y lo mas grave: el 80% de los organizadores no conserva ningun
  historial digital de sus ventas.

Todo esto representa perdidas economicas del 5 al 8 por ciento
de los ingresos por evento, segun nuestras estimaciones."


====================================================================
DIAPOSITIVA 4 - PROCESO AS-IS (45 segundos)
====================================================================

QUE DECIR:
"Este es el proceso actual, el famoso 'como se hace hoy'.

El organizador crea el evento en Excel o por WhatsApp, define
los precios manualmente, y vende las entradas de forma presencial
o por transferencia bancaria.

El comprador tiene que contactar al organizador, hacer la
transferencia, enviar el comprobante por WhatsApp, y recibir
una anotacion manual como unica confirmacion.

El dia del evento, el organizador imprime una lista y verifica
uno por uno a cada asistente. No hay control de stock en tiempo
real, no hay validacion automatica, y todo depende del papel
y del WhatsApp.

Los principales problemas son: procesos lentos, riesgo de
falsificacion, filas largas y ninguna metrica de ventas."


====================================================================
DIAPOSITIVA 5 - PROCESO TO-BE (1 minuto)
====================================================================

QUE DECIR:
"Frente a esa realidad, propusimos TicketWise, que automatiza
todo el ciclo en 6 pasos:

Paso 1: El organizador crea el evento en la plataforma con
nombre, fecha, categoria, imagen y los tipos de entrada con
precio y stock.

Paso 2: El usuario compra las entradas online, selecciona tipo
y cantidad, sube el comprobante de pago y genera una orden
pendiente.

Paso 3: El validador revisa el comprobante en el panel, lo
aprueba o rechaza. Si lo aprueba, el sistema genera
automaticamente los tickets con codigo QR.

Paso 4: El usuario recibe su ticket con un UUID unico de
36 caracteres y un codigo QR. Puede descargarlo en PDF o
mostrarlo desde el movil.

Paso 5: En el acceso, el validador escanea el QR con la
camara del dispositivo. El sistema verifica la validez y
marca el ticket como usado al instante.

Paso 6: El organizador ve en tiempo real las ventas, el
porcentaje de ocupacion, los ingresos y las estadisticas
desde el dashboard."


====================================================================
DIAPOSITIVA 6 - DIAGRAMA DE CONTEXTO (45 segundos)
====================================================================

QUE DECIR:
"Este es el diagrama de contexto del sistema. Muestra a
TicketWise como el proceso central, y las 5 entidades externas
que interactuan con el:

- El Administrador, que gestiona usuarios y configura el sistema.
- El Organizador, que crea eventos y controla ventas.
- El Validador, que aprueba pagos y escanea QR en accesos.
- El Usuario o Cliente, que compra entradas y descarga tickets.
- Y el Sistema de Archivos, que almacena las imagenes y los
  comprobantes de pago.

Cada entidad intercambia informacion especifica con el sistema
central, como se muestra en las flechas de ida y vuelta."


====================================================================
DIAPOSITIVA 7 - DIAGRAMA DER (45 segundos)
====================================================================

QUE DECIR:
"Pasamos al modelo de datos. El sistema cuenta con 7 tablas
principales en PostgreSQL:

- users: almacena los usuarios con su rol asignado.
- events: los eventos con toda su informacion.
- ticket_types: los tipos de entrada asociados a cada evento.
- orders: las ordenes de compra generadas por los usuarios.
- tickets: los tickets individuales con su UUID y codigo QR.
- event_organizers: la tabla pivote que relaciona eventos
  con organizadores y validadores.
- companies: para soporte multi-empresa.

Las relaciones principales son: un evento puede tener muchos
tipos de entrada, una orden genera muchos tickets, y los
eventos se relacionan con usuarios a traves de la tabla
event_organizers."


====================================================================
DIAPOSITIVA 8 - UML CASOS DE USO (45 segundos)
====================================================================

QUE DECIR:
"Este diagrama UML muestra los 10 casos de uso principales
del sistema, organizados por los 4 actores:

El Administrador puede gestionar usuarios y ver el dashboard
global.

El Organizador puede gestionar eventos y ver estadisticas.

El Validador puede validar comprobantes de pago y escanear
tickets QR en el acceso.

El Usuario o Cliente puede registrarse, iniciar sesion,
comprar entradas y descargar sus tickets en PDF.

Los casos de uso mas importantes son: Comprar Entradas,
Validar Comprobante, Escanear Ticket y Gestionar Eventos,
que representan el nucleo funcional del sistema."


====================================================================
DIAPOSITIVA 9 - MODELO DE NEGOCIO (1 minuto)
====================================================================

QUE DECIR:
"Ahora veamos el modelo de negocio. TicketWise opera bajo un
modelo hibrido B2B2C.

Como crea valor: automatiza completamente el ciclo de venta
de entradas, eliminando procesos manuales y reduciendo fraudes.

Como entrega valor: a traves de una plataforma web responsive
disponible 24/7 desde cualquier dispositivo, sin instalacion.

Como captura valor: mediante tres mecanismos: comision por
entrada vendida, planes de suscripcion mensual, y servicios
de promocion.

Tenemos tres planes:

El Plan Basico es gratuito, solo cobramos una comision del
8% por entrada vendida. Ideal para organizadores ocasionales.

El Plan Profesional cuesta 99 mil guaranies por mes y reduce
la comision al 5%. Incluye eventos ilimitados, dashboard
avanzado y soporte prioritario.

El Plan Promocion cuesta 149 mil guaranies por mes e incluye
todo lo anterior mas publicidad destacada en la plataforma
y en redes sociales.

La relacion comercial es B2B2C: los organizadores pagan el
servicio (B2B), y los asistentes compran las entradas (B2C),
pero la comision la absorbe el organizador, no el comprador."


====================================================================
DIAPOSITIVA 10 - LEAN CANVAS (1 minuto)
====================================================================

QUE DECIR:
"Este es el Lean Canvas, que resume el modelo de negocio
en 9 bloques:

Problema: gestion manual, filas largas, validacion lenta,
falsificacion y falta de datos.

Solucion: plataforma web integral con venta online,
validacion digital, tickets QR y dashboard en tiempo real.

Propuesta de valor: una plataforma todo-en-uno para gestionar,
vender y validar entradas de forma automatica, segura y
en tiempo real.

Ventaja competitiva: tecnologia moderna con Next.js, QR
unicos, 4 roles diferenciados, y adaptacion al contexto
paraguayo con precios en guaranies.

Segmentos: organizadores de eventos como clientes B2B,
y asistentes como usuarios B2C.

Metricas clave: entradas vendidas, ocupacion del aforo,
tiempo de validacion e ingresos por evento.

Canales: sitio web, redes sociales, referencias y demos
presenciales.

Early adopters: eventos academicos universitarios y ferias
culturales en Asuncion.

En costos, tenemos costos fijos de aproximadamente 45 dolares
mensuales entre servidor VPS, dominio y herramientas.
Y los ingresos vienen de comisiones del 5 al 8 por ciento,
suscripciones de 99 y 149 mil guaranies, y servicios
adicionales.

El punto de equilibrio se alcanza con solo 45 entradas
vendidas por mes, lo que hace el modelo viable desde el
primer mes de operacion."


====================================================================
DIAPOSITIVA 11 - STACK TECNOLOGICO (45 segundos)
====================================================================

QUE DECIR:
"En cuanto a las tecnologias utilizadas, el sistema esta
construido con un stack moderno full-stack:

En el frontend: Next.js 14 con App Router, React 18 con
TypeScript, TailwindCSS con componentes shadcn/ui para la
interfaz, Recharts para los graficos del dashboard, y
qrcode.react combinado con jspdf para generar los tickets
en PDF con codigo QR.

En el backend: API Routes de Next.js que funcionan como
endpoints RESTful, autenticacion JWT con la libreria Jose,
bcryptjs para hashing de contrasenas, y Zod para validacion
de datos.

En la base de datos e infraestructura: PostgreSQL como motor
de base de datos relacional, Docker con Nginx para el
despliegue en produccion, Prometheus y Grafana para el
monitoreo de metricas del servidor.

Todo el sistema corre sobre un unico proyecto Next.js,
lo que simplifica el desarrollo y el despliegue."


====================================================================
DIAPOSITIVA 12 - CONCLUSIONES (30 segundos)
====================================================================

QUE DECIR:

"Para cerrar, quiero destacar 4 puntos:

Primero, TicketWise es una solucion innovadora y concreta
para digitalizar la venta de entradas en Paraguay, adaptada
al mercado local.

Segundo, automatiza todo el proceso, reduciendo errores
humanos del 5-10% a casi cero, eliminando filas y
previniendo falsificaciones.

Tercero, utiliza tecnologia moderna de punta a punta:
Next.js, React, TypeScript y PostgreSQL.

Y cuarto, es un proyecto real, en desarrollo activo, con
una arquitectura preparada para escalar.

Muchas gracias por su atencion. Quedo atento a sus preguntas."


====================================================================
RESUMEN DE TIEMPOS:
====================================================================
| Diapositiva                  | Tiempo |
|------------------------------|--------|
| 1. Portada                   | 30 seg |
| 2. Agenda                    | 30 seg |
| 3. Problema Cuantificado     | 1 min  |
| 4. Proceso AS-IS             | 45 seg |
| 5. Proceso TO-BE             | 1 min  |
| 6. Diagrama de Contexto      | 45 seg |
| 7. Diagrama DER              | 45 seg |
| 8. UML Casos de Uso          | 45 seg |
| 9. Modelo de Negocio         | 1 min  |
| 10. Lean Canvas              | 1 min  |
| 11. Stack Tecnologico        | 45 seg |
| 12. Conclusiones             | 30 seg |
|------------------------------|--------|
| TOTAL                        | ~9 min |

Tiempo extra para preguntas: ~1 minuto
====================================================================
