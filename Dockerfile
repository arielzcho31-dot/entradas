# Dockerfile para TicketWise - Next.js App
# Multi-stage build para optimizar el tamaño de la imagen

# ======================================================================
# Stage 1: Dependencies
# ======================================================================
FROM node:18-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Copiar archivos de dependencias
COPY package.json package-lock.json* ./
RUN npm ci --only=production

# ======================================================================
# Stage 2: Builder
# ======================================================================
FROM node:18-alpine AS builder
WORKDIR /app

# Copiar dependencias del stage anterior
COPY --from=deps /app/node_modules ./node_modules

# Copiar archivos de código fuente
COPY package*.json ./
COPY tsconfig.json ./
COPY next.config.ts ./
COPY postcss.config.mjs ./
COPY tailwind.config.ts ./
COPY src ./src
COPY public ./public

# Variables de entorno para build
ENV NEXT_TELEMETRY_DISABLED 1
ENV NODE_ENV production

# Instalar todas las dependencias (incluyendo devDependencies para build)
RUN npm ci

# Build de la aplicación
RUN npm run build

# ======================================================================
# Stage 3: Runner (Production)
# ======================================================================
FROM node:18-alpine AS runner
WORKDIR /app

# Crear usuario no-root para seguridad
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Configuración de producción
ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

# Copiar node_modules de producción
COPY --from=deps /app/node_modules ./node_modules

# Copiar archivos de build
COPY --from=builder --chown=nextjs:nodejs /app/.next ./.next
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/next.config.ts ./

# Crear directorios necesarios
RUN mkdir -p /app/uploads && chown -R nextjs:nodejs /app/uploads

# Cambiar a usuario no-root
USER nextjs

# Exponer puerto
EXPOSE 3000

# Variables de entorno
ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

# Comando para iniciar la aplicación
CMD ["npm", "start"]