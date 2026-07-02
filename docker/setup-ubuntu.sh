#!/bin/bash
# Script de setup automatizado para Ubuntu Server - TicketWise

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Configurando TicketWise en Ubuntu Server...${NC}"

# Función para verificar si un comando existe
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Función para instalar Docker
install_docker() {
    echo -e "${YELLOW}📦 Instalando Docker...${NC}"
    
    # Actualizar sistema
    sudo apt update
    sudo apt install -y apt-transport-https ca-certificates curl gnupg lsb-release
    
    # Agregar clave GPG oficial de Docker
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
    
    # Agregar repositorio
    echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
    
    # Instalar Docker
    sudo apt update
    sudo apt install -y docker-ce docker-ce-cli containerd.io
    
    # Agregar usuario al grupo docker
    sudo usermod -aG docker $USER
    
    # Iniciar y habilitar Docker
    sudo systemctl start docker
    sudo systemctl enable docker
    
    echo -e "${GREEN}✅ Docker instalado correctamente${NC}"
}

# Función para instalar Docker Compose
install_docker_compose() {
    echo -e "${YELLOW}📦 Instalando Docker Compose...${NC}"
    
    # Descargar la última versión
    sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    
    # Hacer ejecutable
    sudo chmod +x /usr/local/bin/docker-compose
    
    echo -e "${GREEN}✅ Docker Compose instalado correctamente${NC}"
}

# Función para configurar firewall
setup_firewall() {
    echo -e "${YELLOW}🔥 Configurando firewall...${NC}"
    
    # Instalar ufw si no está
    sudo apt install -y ufw
    
    # Configurar reglas básicas
    sudo ufw default deny incoming
    sudo ufw default allow outgoing
    
    # Permitir SSH (¡IMPORTANTE!)
    sudo ufw allow ssh
    sudo ufw allow 22
    
    # Permitir HTTP y HTTPS
    sudo ufw allow 80
    sudo ufw allow 443
    
    # Permitir puerto de desarrollo
    sudo ufw allow 9002
    
    # Activar firewall
    echo "y" | sudo ufw enable
    
    echo -e "${GREEN}✅ Firewall configurado${NC}"
    sudo ufw status
}

# Función para crear directorios necesarios
setup_directories() {
    echo -e "${YELLOW}📁 Creando directorios necesarios...${NC}"
    
    # Crear directorios
    mkdir -p uploads logs ssl certbot/www certbot/conf monitoring
    
    # Establecer permisos
    chmod 755 uploads logs ssl
    chmod 755 certbot/www certbot/conf
    
    # Crear archivo de logs
    touch logs/app.log
    
    echo -e "${GREEN}✅ Directorios creados${NC}"
}

# Función para configurar variables de entorno
setup_env() {
    echo -e "${YELLOW}⚙️ Configurando variables de entorno...${NC}"
    
    if [ ! -f .env.local ]; then
        if [ -f .env.docker.example ]; then
            cp .env.docker.example .env.local
            echo -e "${GREEN}✅ Archivo .env.local creado desde template${NC}"
            echo -e "${YELLOW}🔧 IMPORTANTE: Edita .env.local con tus configuraciones reales${NC}"
            echo -e "${YELLOW}   Ejecuta: nano .env.local${NC}"
        else
            echo -e "${RED}❌ No se encontró .env.docker.example${NC}"
        fi
    else
        echo -e "${GREEN}✅ .env.local ya existe${NC}"
    fi
}

# Función para verificar IP pública
check_public_ip() {
    echo -e "${YELLOW}🌐 Verificando conectividad...${NC}"
    
    # IP local
    LOCAL_IP=$(ip addr show | grep 'inet ' | grep -v '127.0.0.1' | head -1 | awk '{print $2}' | cut -d/ -f1)
    echo -e "${BLUE}📍 IP Local: ${LOCAL_IP}${NC}"
    
    # IP pública (si está disponible)
    PUBLIC_IP=$(curl -s ifconfig.me 2>/dev/null || echo "No disponible")
    echo -e "${BLUE}🌍 IP Pública: ${PUBLIC_IP}${NC}"
    
    if [ "$PUBLIC_IP" != "No disponible" ]; then
        echo -e "${GREEN}✅ Servidor accesible desde internet${NC}"
        echo -e "${YELLOW}🔗 Tu aplicación estará disponible en: http://${PUBLIC_IP}${NC}"
    else
        echo -e "${YELLOW}⚠️ Solo accesible en red local: http://${LOCAL_IP}${NC}"
    fi
}

# Función principal
main() {
    echo -e "${BLUE}🔍 Verificando sistema...${NC}"
    
    # Verificar si estamos en Ubuntu
    if [ ! -f /etc/lsb-release ]; then
        echo -e "${RED}❌ Este script está diseñado para Ubuntu${NC}"
        exit 1
    fi
    
    # Verificar permisos de sudo
    if ! sudo -n true 2>/dev/null; then
        echo -e "${YELLOW}🔑 Se requieren permisos de administrador${NC}"
        sudo -v
    fi
    
    # Verificar e instalar Docker
    if ! command_exists docker; then
        install_docker
        echo -e "${YELLOW}🔄 Necesitas reiniciar sesión o ejecutar: newgrp docker${NC}"
    else
        echo -e "${GREEN}✅ Docker ya está instalado${NC}"
        docker --version
    fi
    
    # Verificar e instalar Docker Compose
    if ! command_exists docker-compose; then
        install_docker_compose
    else
        echo -e "${GREEN}✅ Docker Compose ya está instalado${NC}"
        docker-compose --version
    fi
    
    # Configurar directorios
    setup_directories
    
    # Configurar variables de entorno
    setup_env
    
    # Configurar firewall
    echo -e "${YELLOW}¿Quieres configurar el firewall? (y/n)${NC}"
    read -r setup_fw
    if [[ "$setup_fw" =~ ^[yY] ]]; then
        setup_firewall
    fi
    
    # Verificar IP
    check_public_ip
    
    echo -e "${GREEN}🎉 ¡Configuración completada!${NC}"
    echo -e "${BLUE}📋 Próximos pasos:${NC}"
    echo -e "   1. Editar .env.local: ${YELLOW}nano .env.local${NC}"
    echo -e "   2. Desarrollo: ${YELLOW}./docker.sh dev${NC}"
    echo -e "   3. Producción: ${YELLOW}./docker.sh prod${NC}"
    echo -e "   4. Ver logs: ${YELLOW}./docker.sh logs${NC}"
    echo -e "   5. Estado: ${YELLOW}./docker.sh health${NC}"
}

# Ejecutar función principal
main "$@"