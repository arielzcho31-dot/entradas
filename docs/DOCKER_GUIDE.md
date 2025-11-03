# Guía de Docker para TicketWise

## 📋 Requisitos Previos

- [Docker](https://www.docker.com/get-started) instalado
- [Docker Compose](https://docs.docker.com/compose/install/) instalado
- Al menos 4GB de RAM disponible
- Puerto 80, 443, 3000 y 9002 disponibles

## 🚀 Inicio Rápido

### 1. Configuración Inicial
```bash
# Windows PowerShell
.\docker.ps1 setup

# Linux/macOS
./docker.sh setup
```

### 2. Configurar Variables de Entorno
Edita el archivo `.env.local` con tus configuraciones:
```bash
# Copia el archivo de ejemplo y edítalo
cp .env.docker.example .env.local
# Edita .env.local con tus valores reales
```

### 3. Iniciar en Desarrollo
```bash
# Windows PowerShell
.\docker.ps1 dev

# Linux/macOS
./docker.sh dev
```
La aplicación estará disponible en: http://localhost:9002

### 4. Iniciar en Producción
```bash
# Windows PowerShell
.\docker.ps1 prod

# Linux/macOS
./docker.sh prod
```
La aplicación estará disponible en: http://localhost

## 📁 Estructura de Archivos Docker

```
.
├── Dockerfile              # Imagen de producción (optimizada)
├── Dockerfile.dev         # Imagen de desarrollo
├── docker-compose.yml     # Configuración de producción
├── docker-compose.dev.yml # Configuración de desarrollo
├── nginx.conf             # Configuración del proxy reverso
├── .dockerignore          # Archivos a ignorar en build
├── .env.docker.example    # Template de variables de entorno
├── docker.sh              # Scripts de gestión (Linux/macOS)
├── docker.ps1             # Scripts de gestión (Windows)
└── docs/
    └── DOCKER_GUIDE.md    # Esta guía
```

## 🔧 Comandos Disponibles

### Scripts de Gestión
| Comando | Descripción |
|---------|-------------|
| `setup` | Configuración inicial del proyecto |
| `dev` | Iniciar en modo desarrollo |
| `prod` | Iniciar en modo producción |
| `build` | Construir imágenes Docker |
| `stop` | Detener todos los servicios |
| `restart` | Reiniciar servicios |
| `logs` | Ver logs de la aplicación |
| `clean` | Limpiar contenedores e imágenes |
| `health` | Verificar estado de servicios |

### Comandos Docker Manuales

#### Desarrollo
```bash
# Iniciar en desarrollo
docker-compose -f docker-compose.dev.yml up --build

# Detener desarrollo
docker-compose -f docker-compose.dev.yml down
```

#### Producción
```bash
# Iniciar en producción
docker-compose up -d --build

# Detener producción
docker-compose down

# Ver logs
docker-compose logs -f app

# Ver estado
docker-compose ps
```

## 🌐 Configuración de Red

### Desarrollo
- **Aplicación**: http://localhost:9002
- **Hot Reload**: Habilitado
- **Volúmenes**: Código fuente montado para desarrollo

### Producción
- **Aplicación**: http://localhost (Puerto 80)
- **HTTPS**: http://localhost:443 (requiere certificados SSL)
- **Proxy**: Nginx como proxy reverso
- **Archivos estáticos**: Servidos por Nginx

## 📊 Monitoreo y Logs

### Ver Logs
```bash
# Logs de la aplicación
docker-compose logs -f app

# Logs de Nginx
docker-compose logs -f nginx

# Logs de todos los servicios
docker-compose logs -f
```

### Verificar Estado
```bash
# Estado de contenedores
docker-compose ps

# Uso de recursos
docker stats

# Health check
curl http://localhost/health
```

## 🔒 Configuración de Seguridad

### Variables de Entorno Sensibles
Nunca commits archivos `.env.local` al repositorio. Configura:

1. **Firebase/Supabase**: Claves de API y configuración
2. **JWT Secrets**: Para autenticación
3. **Email**: Credenciales SMTP
4. **Base de datos**: Strings de conexión

### HTTPS en Producción
1. Obtén certificados SSL (Let's Encrypt recomendado)
2. Coloca certificados en el directorio `ssl/`
3. Descomenta la configuración HTTPS en `nginx.conf`
4. Actualiza las variables de entorno con URLs HTTPS

## 🗄️ Persistencia de Datos

### Volúmenes
- **uploads/**: Archivos subidos por usuarios
- **ssl/**: Certificados SSL (si se usan)

### Backup
```bash
# Backup de uploads
docker run --rm -v "$(pwd)/uploads:/data" -v "$(pwd)/backup:/backup" alpine tar czf /backup/uploads-$(date +%Y%m%d).tar.gz -C /data .

# Restaurar uploads
docker run --rm -v "$(pwd)/uploads:/data" -v "$(pwd)/backup:/backup" alpine tar xzf /backup/uploads-YYYYMMDD.tar.gz -C /data
```

## 🚀 Despliegue en Producción

### 1. Preparación
```bash
# Configurar variables de entorno de producción
cp .env.docker.example .env.local
# Editar .env.local con valores de producción

# Construir imágenes
docker-compose build --no-cache
```

### 2. Configurar SSL (Recomendado)
```bash
# Crear directorio SSL
mkdir ssl

# Copiar certificados (ejemplo con Let's Encrypt)
cp /etc/letsencrypt/live/tu-dominio.com/fullchain.pem ssl/certificate.crt
cp /etc/letsencrypt/live/tu-dominio.com/privkey.pem ssl/private.key

# Actualizar nginx.conf para habilitar HTTPS
```

### 3. Iniciar Servicios
```bash
# Iniciar en producción
docker-compose up -d

# Verificar estado
docker-compose ps
curl http://tu-dominio.com/health
```

## 🐛 Troubleshooting

### Problemas Comunes

#### Puerto en Uso
```bash
# Verificar qué usa el puerto
netstat -tulpn | grep :80
# Detener servicio conflictivo
sudo systemctl stop apache2  # ejemplo
```

#### Permisos de Archivos
```bash
# Arreglar permisos de uploads
sudo chown -R 1001:1001 uploads/
chmod -R 755 uploads/
```

#### Memoria Insuficiente
```bash
# Verificar uso de memoria
docker stats
# Aumentar memoria disponible en Docker Desktop
```

#### Logs de Errores
```bash
# Ver logs detallados
docker-compose logs --tail=100 app

# Acceder al contenedor
docker-compose exec app sh
```

### Comandos de Depuración
```bash
# Inspeccionar imagen
docker image inspect ticketwise_app

# Ver configuración de red
docker network ls
docker network inspect ticketwise_ticketwise-network

# Limpiar todo (CUIDADO: elimina datos)
docker system prune -a --volumes
```

## 📝 Notas Adicionales

- **Performance**: La imagen de producción está optimizada con multi-stage build
- **Seguridad**: Se ejecuta como usuario no-root en producción
- **Escalabilidad**: Se puede escalar horizontalmente con Docker Swarm o Kubernetes
- **CI/CD**: Los Dockerfiles son compatibles con pipelines de CI/CD

## 🆘 Soporte

Si encuentras problemas:

1. Verifica que Docker y Docker Compose estén actualizados
2. Revisa los logs con `docker-compose logs`
3. Verifica que todos los puertos estén disponibles
4. Confirma que las variables de entorno estén configuradas correctamente

Para más ayuda, consulta la documentación principal del proyecto.