# 🎫 TicketWise - Plataforma de Gestión de Eventos

Aplicación web moderna para la venta y gestión de entradas de múltiples eventos, construida con Next.js 15, React, PostgreSQL, ShadCN UI y Tailwind CSS. Incluye autenticación de usuarios, roles diferenciados, verificación de pagos y escaneo de códigos QR.

## ✨ Características

- 🎪 **Multi-evento:** Gestiona múltiples eventos simultáneamente
- 🎟️ **Tipos de entrada:** Define diferentes tipos (General, VIP, Estudiante, etc.)
- 👥 **Sistema de roles:** Admin, Organizador, Validador, Usuario
- 💳 **Verificación de pagos:** Aprobación manual de comprobantes
- 📱 **Escaneo QR:** Validación de entradas con cámara
- 📊 **Dashboard:** Estadísticas en tiempo real por evento
- 🔒 **Seguridad:** Autenticación con JWT y bcrypt

---

## 🚀 Instalación Rápida

### Requisitos Previos

- [Node.js](https://nodejs.org/en/) v18 o superior
- [PostgreSQL](https://www.postgresql.org/download/) v14 o superior
- [npm](https://www.npmjs.com/) (incluido con Node.js)

### 1. Clonar e Instalar

```bash
# Clonar el repositorio
git clone <tu-repo>
cd web_modificable

# Instalar dependencias
npm install
```

### 2. Configurar Base de Datos PostgreSQL

```bash
# Crear base de datos (desde psql)
createdb ticketwase2

# Aplicar esquema
psql -U postgres -d ticketwase2 -f docs/apply-schema.sql
```

O desde pgAdmin: ejecuta el archivo `docs/schema-postgresql.sql`

### 3. Configurar Variables de Entorno

Crea un archivo `.env.local` en la raíz:

```env
# PostgreSQL
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_NAME=ticketwase2
DATABASE_USER=postgres
DATABASE_PASSWORD=tu_password

# JWT
JWT_SECRET=tu_secreto_super_seguro_cambiar_en_produccion

# App
NODE_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:9002
```

Ver `.env.example` para todas las variables disponibles.

### 4. Ejecutar la Aplicación

```bash
npm run dev
```

Abre [http://localhost:9002](http://localhost:9002) en tu navegador.

### 5. Credenciales de Prueba

Usuario admin por defecto:
- **Email:** admin@ticketwise.com
- **Password:** Admin123!

---

## 📁 Estructura del Proyecto

```
web_modificable/
├── src/
│   ├── app/              # Next.js App Router
│   │   ├── api/          # Endpoints API
│   │   ├── dashboard/    # Dashboards por rol
│   │   ├── events/       # Páginas de eventos
│   │   └── ...
│   ├── components/       # Componentes React
│   ├── lib/              # Utilidades y DB
│   │   └── db.ts         # Cliente PostgreSQL
│   ├── types/            # TypeScript types
│   └── context/          # React Context
├── docs/                 # Documentación
│   ├── bdd.txt           # Esquema de BD
│   ├── schema-postgresql.sql
│   ├── apply-schema.sql
│   └── POSTGRESQL_MIGRATION.md
└── public/               # Assets estáticos
```
tar --exclude=project.tar.gz -czvf project.tar.gz .