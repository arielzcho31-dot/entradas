#!/bin/bash
# Scripts para manejo de Docker - TicketWise (Linux/Ubuntu)

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Función para mostrar ayuda
show_help() {
    echo -e "${BLUE}TicketWise Docker Management Scripts${NC}"
    echo ""
    echo "Uso: $0 [comando]"
    echo ""
    echo "Comandos disponibles:"
    echo "  dev           - Iniciar en modo desarrollo"
    echo "  prod          - Iniciar en modo producción"
    echo "  build         - Construir imágenes Docker"
    echo "  stop          - Detener todos los contenedores"
    echo "  restart       - Reiniciar servicios"
    echo "  logs          - Ver logs de la aplicación"
    echo "  clean         - Limpiar contenedores e imágenes"
    echo "  setup         - Configuración inicial"
    echo "  health        - Verificar estado de los servicios"
    echo "  help          - Mostrar esta ayuda"
}

# Función para verificar si Docker está instalado
check_docker() {
    if ! command -v docker &> /dev/null; then
        echo -e "${RED}Error: Docker no está instalado${NC}"
        exit 1
    fi
    
    if ! command -v docker-compose &> /dev/null; then
        echo -e "${RED}Error: Docker Compose no está instalado${NC}"
        exit 1
    fi
}

# Función para configuración inicial
setup() {
    echo -e "${BLUE}Configurando TicketWise para Docker...${NC}"
    
    # Verificar Docker
    check_docker
    
    # Crear directorio de uploads si no existe
    mkdir -p uploads
    chmod 755 uploads
    
    # Crear archivo .env.local si no existe
    if [ ! -f .env.local ]; then
        echo -e "${YELLOW}Creando archivo .env.local desde el template...${NC}"
        cp .env.docker.example .env.local
        echo -e "${GREEN}¡Archivo .env.local creado!${NC}"
        echo -e "${YELLOW}Por favor, edita .env.local con tus configuraciones reales${NC}"
    else
        echo -e "${GREEN}.env.local ya existe${NC}"
    fi
    
    # Crear directorio para SSL si no existe
    mkdir -p ssl
    
    echo -e "${GREEN}Configuración inicial completada${NC}"
}

# Función para modo desarrollo
dev() {
    echo -e "${BLUE}Iniciando TicketWise en modo desarrollo...${NC}"
    check_docker
    docker-compose -f docker-compose.dev.yml up --build
}

# Función para modo producción
prod() {
    echo -e "${BLUE}Iniciando TicketWise en modo producción...${NC}"
    check_docker
    docker-compose up -d --build
    echo -e "${GREEN}TicketWise iniciado en modo producción${NC}"
    echo -e "${YELLOW}Accede a: http://localhost${NC}"
}

# Función para construir imágenes
build() {
    echo -e "${BLUE}Construyendo imágenes Docker...${NC}"
    check_docker
    docker-compose build --no-cache
    echo -e "${GREEN}Imágenes construidas exitosamente${NC}"
}

# Función para detener servicios
stop() {
    echo -e "${BLUE}Deteniendo servicios...${NC}"
    docker-compose down
    docker-compose -f docker-compose.dev.yml down
    echo -e "${GREEN}Servicios detenidos${NC}"
}

# Función para reiniciar servicios
restart() {
    echo -e "${BLUE}Reiniciando servicios...${NC}"
    stop
    prod
}

# Función para ver logs
logs() {
    echo -e "${BLUE}Mostrando logs de la aplicación...${NC}"
    docker-compose logs -f app
}

# Función para limpiar contenedores e imágenes
clean() {
    echo -e "${YELLOW}¿Estás seguro de que quieres limpiar todos los contenedores e imágenes? (y/n)${NC}"
    read -r response
    if [[ "$response" =~ ^([yY][eE][sS]|[yY])$ ]]; then
        echo -e "${BLUE}Limpiando contenedores e imágenes...${NC}"
        docker-compose down --rmi all --volumes
        docker system prune -f
        echo -e "${GREEN}Limpieza completada${NC}"
    else
        echo -e "${YELLOW}Operación cancelada${NC}"
    fi
}

# Función para verificar estado de servicios
health() {
    echo -e "${BLUE}Verificando estado de los servicios...${NC}"
    
    if docker-compose ps | grep -q "Up"; then
        echo -e "${GREEN}✓ Servicios en ejecución${NC}"
        docker-compose ps
        
        # Verificar conectividad a la aplicación
        if curl -s http://localhost/health > /dev/null; then
            echo -e "${GREEN}✓ Aplicación respondiendo correctamente${NC}"
        else
            echo -e "${RED}✗ Aplicación no responde${NC}"
        fi
    else
        echo -e "${RED}✗ No hay servicios en ejecución${NC}"
    fi
}

# Procesar argumentos
case "${1:-help}" in
    "dev")
        dev
        ;;
    "prod")
        prod
        ;;
    "build")
        build
        ;;
    "stop")
        stop
        ;;
    "restart")
        restart
        ;;
    "logs")
        logs
        ;;
    "clean")
        clean
        ;;
    "setup")
        setup
        ;;
    "health")
        health
        ;;
    "help"|*)
        show_help
        ;;
esac