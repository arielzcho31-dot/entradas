# Script para configurar SSL con Let's Encrypt - TicketWise
param(
    [Parameter(Mandatory=$true)]
    [string]$Domain,
    
    [Parameter(Mandatory=$true)]
    [string]$Email,
    
    [Parameter()]
    [switch]$Staging = $false
)

Write-Host "Configurando SSL para $Domain..." -ForegroundColor Blue

# Verificar que el dominio esté configurado
if ($Domain -eq "tu-dominio.com") {
    Write-Host "Error: Debes cambiar 'tu-dominio.com' por tu dominio real" -ForegroundColor Red
    exit 1
}

# Crear directorios necesarios
$directories = @("certbot/www", "certbot/conf", "ssl")
foreach ($dir in $directories) {
    if (-not (Test-Path $dir)) {
        New-Item -ItemType Directory -Path $dir -Force
        Write-Host "Directorio $dir creado" -ForegroundColor Green
    }
}

# Configurar variables de entorno para producción
Write-Host "Configurando variables de entorno para producción..." -ForegroundColor Yellow

if (-not (Test-Path ".env.production")) {
    Copy-Item ".env.local" ".env.production"
}

# Actualizar configuración de Nginx con el dominio real
$nginxConfig = Get-Content "nginx.prod.conf" -Raw
$nginxConfig = $nginxConfig -replace "tu-dominio\.com", $Domain
Set-Content "nginx.prod.conf" $nginxConfig

Write-Host "Configuración de Nginx actualizada para $Domain" -ForegroundColor Green

# Determinar servidor de certificación
$certbotServer = if ($Staging) { 
    "--staging" 
} else { 
    "" 
}

Write-Host "Iniciando servicios para obtener certificado SSL..." -ForegroundColor Blue

# Iniciar nginx temporalmente para verificación de dominio
docker-compose -f docker-compose.prod.yml up -d nginx

Start-Sleep -Seconds 10

# Obtener certificado SSL
Write-Host "Obteniendo certificado SSL de Let's Encrypt..." -ForegroundColor Yellow

$certbotCommand = @"
docker run --rm -v "${PWD}/certbot/www:/var/www/certbot" -v "${PWD}/certbot/conf:/etc/letsencrypt" certbot/certbot certonly --webroot --webroot-path=/var/www/certbot --email $Email --agree-tos --no-eff-email $certbotServer -d $Domain -d www.$Domain
"@

Invoke-Expression $certbotCommand

if ($LASTEXITCODE -eq 0) {
    Write-Host "¡Certificado SSL obtenido exitosamente!" -ForegroundColor Green
    
    # Reiniciar servicios con SSL habilitado
    Write-Host "Reiniciando servicios con SSL..." -ForegroundColor Blue
    docker-compose -f docker-compose.prod.yml down
    docker-compose -f docker-compose.prod.yml up -d
    
    Write-Host "¡TicketWise está ahora disponible en https://$Domain!" -ForegroundColor Green
    
    # Verificar certificado
    Start-Sleep -Seconds 15
    try {
        $response = Invoke-WebRequest -Uri "https://$Domain/health" -TimeoutSec 10
        Write-Host "✓ Sitio HTTPS verificado exitosamente" -ForegroundColor Green
    } catch {
        Write-Host "⚠ Advertencia: No se pudo verificar el sitio HTTPS inmediatamente" -ForegroundColor Yellow
        Write-Host "Esto es normal, puede tomar unos minutos propagarse" -ForegroundColor Yellow
    }
    
} else {
    Write-Host "Error al obtener el certificado SSL" -ForegroundColor Red
    Write-Host "Verifica que:" -ForegroundColor Yellow
    Write-Host "1. El dominio $Domain apunte a la IP de tu servidor" -ForegroundColor Yellow
    Write-Host "2. Los puertos 80 y 443 estén abiertos" -ForegroundColor Yellow
    Write-Host "3. No haya otros servicios usando estos puertos" -ForegroundColor Yellow
}

Write-Host "`nPara renovar certificados automáticamente, el contenedor certbot se encargará." -ForegroundColor Blue
Write-Host "Los certificados se renovarán automáticamente cada 12 horas." -ForegroundColor Blue