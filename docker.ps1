# Scripts para manejo de Docker - TicketWise (Windows PowerShell)
param(
    [Parameter(Position=0)]
    [string]$Command = "help"
)

# Función para mostrar ayuda
function Show-Help {
    Write-Host "TicketWise Docker Management Scripts" -ForegroundColor Blue
    Write-Host ""
    Write-Host "Uso: .\docker.ps1 [comando]"
    Write-Host ""
    Write-Host "Comandos disponibles:"
    Write-Host "  dev           - Iniciar en modo desarrollo"
    Write-Host "  prod          - Iniciar en modo producción"
    Write-Host "  build         - Construir imágenes Docker"
    Write-Host "  stop          - Detener todos los contenedores"
    Write-Host "  restart       - Reiniciar servicios"
    Write-Host "  logs          - Ver logs de la aplicación"
    Write-Host "  clean         - Limpiar contenedores e imágenes"
    Write-Host "  setup         - Configuración inicial"
    Write-Host "  health        - Verificar estado de los servicios"
    Write-Host "  help          - Mostrar esta ayuda"
}

# Función para verificar si Docker está instalado
function Test-Docker {
    if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
        Write-Host "Error: Docker no está instalado" -ForegroundColor Red
        exit 1
    }
    
    if (-not (Get-Command docker-compose -ErrorAction SilentlyContinue)) {
        Write-Host "Error: Docker Compose no está instalado" -ForegroundColor Red
        exit 1
    }
}

# Función para configuración inicial
function Invoke-Setup {
    Write-Host "Configurando TicketWise para Docker..." -ForegroundColor Blue
    
    # Verificar Docker
    Test-Docker
    
    # Crear directorio de uploads si no existe
    if (-not (Test-Path "uploads")) {
        New-Item -ItemType Directory -Path "uploads" | Out-Null
        Write-Host "Directorio uploads creado" -ForegroundColor Green
    }
    
    # Crear archivo .env.local si no existe
    if (-not (Test-Path ".env.local")) {
        Write-Host "Creando archivo .env.local desde el template..." -ForegroundColor Yellow
        Copy-Item ".env.docker.example" ".env.local"
        Write-Host "¡Archivo .env.local creado!" -ForegroundColor Green
        Write-Host "Por favor, edita .env.local con tus configuraciones reales" -ForegroundColor Yellow
    } else {
        Write-Host ".env.local ya existe" -ForegroundColor Green
    }
    
    # Crear directorio para SSL si no existe
    if (-not (Test-Path "ssl")) {
        New-Item -ItemType Directory -Path "ssl" | Out-Null
    }
    
    Write-Host "Configuración inicial completada" -ForegroundColor Green
}

# Función para modo desarrollo
function Start-Dev {
    Write-Host "Iniciando TicketWise en modo desarrollo..." -ForegroundColor Blue
    Test-Docker
    docker-compose -f docker-compose.dev.yml up --build
}

# Función para modo producción
function Start-Prod {
    Write-Host "Iniciando TicketWise en modo producción..." -ForegroundColor Blue
    Test-Docker
    docker-compose up -d --build
    Write-Host "TicketWise iniciado en modo producción" -ForegroundColor Green
    Write-Host "Accede a: http://localhost" -ForegroundColor Yellow
}

# Función para construir imágenes
function Invoke-Build {
    Write-Host "Construyendo imágenes Docker..." -ForegroundColor Blue
    Test-Docker
    docker-compose build --no-cache
    Write-Host "Imágenes construidas exitosamente" -ForegroundColor Green
}

# Función para detener servicios
function Stop-Services {
    Write-Host "Deteniendo servicios..." -ForegroundColor Blue
    docker-compose down
    docker-compose -f docker-compose.dev.yml down
    Write-Host "Servicios detenidos" -ForegroundColor Green
}

# Función para reiniciar servicios
function Restart-Services {
    Write-Host "Reiniciando servicios..." -ForegroundColor Blue
    Stop-Services
    Start-Prod
}

# Función para ver logs
function Show-Logs {
    Write-Host "Mostrando logs de la aplicación..." -ForegroundColor Blue
    docker-compose logs -f app
}

# Función para limpiar contenedores e imágenes
function Invoke-Clean {
    $response = Read-Host "¿Estás seguro de que quieres limpiar todos los contenedores e imágenes? (y/n)"
    if ($response -match "^[yY]") {
        Write-Host "Limpiando contenedores e imágenes..." -ForegroundColor Blue
        docker-compose down --rmi all --volumes
        docker system prune -f
        Write-Host "Limpieza completada" -ForegroundColor Green
    } else {
        Write-Host "Operación cancelada" -ForegroundColor Yellow
    }
}

# Función para verificar estado de servicios
function Test-Health {
    Write-Host "Verificando estado de los servicios..." -ForegroundColor Blue
    
    $running = docker-compose ps --format table | Select-String "Up"
    if ($running) {
        Write-Host "✓ Servicios en ejecución" -ForegroundColor Green
        docker-compose ps
        
        # Verificar conectividad a la aplicación
        try {
            $response = Invoke-WebRequest -Uri "http://localhost/health" -TimeoutSec 5 -ErrorAction Stop
            Write-Host "✓ Aplicación respondiendo correctamente" -ForegroundColor Green
        } catch {
            Write-Host "✗ Aplicación no responde" -ForegroundColor Red
        }
    } else {
        Write-Host "✗ No hay servicios en ejecución" -ForegroundColor Red
    }
}

# Procesar comandos
switch ($Command.ToLower()) {
    "dev" { Start-Dev }
    "prod" { Start-Prod }
    "build" { Invoke-Build }
    "stop" { Stop-Services }
    "restart" { Restart-Services }
    "logs" { Show-Logs }
    "clean" { Invoke-Clean }
    "setup" { Invoke-Setup }
    "health" { Test-Health }
    default { Show-Help }
}