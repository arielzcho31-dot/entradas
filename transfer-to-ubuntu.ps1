# Script para transferir archivos al servidor Ubuntu - TicketWise
param(
    [Parameter(Mandatory=$true)]
    [string]$ServerIP,
    
    [Parameter(Mandatory=$true)]
    [string]$Username,
    
    [Parameter()]
    [string]$TargetPath = "/home/$Username/ticketwise",
    
    [Parameter()]
    [switch]$IncludeNodeModules = $false
)

Write-Host "🚀 Transferindo TicketWise al servidor Ubuntu..." -ForegroundColor Blue

# Verificar que SCP esté disponible (viene con Git for Windows)
if (-not (Get-Command scp -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Error: SCP no está disponible." -ForegroundColor Red
    Write-Host "💡 Instala Git for Windows o usa Windows Subsystem for Linux (WSL)" -ForegroundColor Yellow
    exit 1
}

# Crear lista de archivos a excluir
$excludeList = @()
if (-not $IncludeNodeModules) {
    $excludeList += "node_modules"
}
$excludeList += @(
    ".git",
    ".next",
    "dist",
    "build",
    "test-results",
    "playwright-report",
    "*.log",
    ".env.local",
    ".env.production"
)

Write-Host "📂 Preparando archivos para transferencia..." -ForegroundColor Yellow

# Crear archivo temporal con lista de exclusiones
$excludeFile = "transfer-exclude.txt"
$excludeList | Out-File -FilePath $excludeFile -Encoding utf8

# Crear directorio temporal para archivos a transferir
$tempDir = "temp-transfer"
if (Test-Path $tempDir) {
    Remove-Item $tempDir -Recurse -Force
}
New-Item -ItemType Directory -Path $tempDir | Out-Null

# Copiar archivos necesarios excluyendo los no deseados
Write-Host "📋 Copiando archivos esenciales..." -ForegroundColor Yellow

$filesToCopy = @(
    "src",
    "public", 
    "docs",
    "package.json",
    "package-lock.json",
    "next.config.ts",
    "tsconfig.json",
    "tailwind.config.ts",
    "postcss.config.mjs",
    "components.json",
    "Dockerfile",
    "Dockerfile.dev", 
    "docker-compose.yml",
    "docker-compose.dev.yml",
    "docker-compose.prod.yml",
    "docker-compose.monitoring.yml",
    "nginx.conf",
    "nginx.prod.conf",
    ".dockerignore",
    ".env.docker.example",
    "docker.sh",
    "docker.ps1",
    "setup-ubuntu.sh",
    "setup-ssl.ps1",
    "README.md"
)

foreach ($item in $filesToCopy) {
    if (Test-Path $item) {
        Copy-Item $item -Destination $tempDir -Recurse -Force
        Write-Host "✅ Copiado: $item" -ForegroundColor Green
    } else {
        Write-Host "⚠️  No encontrado: $item" -ForegroundColor Yellow
    }
}

Write-Host "🌐 Conectando al servidor $ServerIP..." -ForegroundColor Blue

# Crear directorio en el servidor
$createDirCommand = "ssh ${Username}@${ServerIP} 'mkdir -p $TargetPath'"
Write-Host "📁 Creando directorio remoto..." -ForegroundColor Yellow
Invoke-Expression $createDirCommand

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Error creando directorio remoto" -ForegroundColor Red
    Remove-Item $tempDir -Recurse -Force
    Remove-Item $excludeFile -Force
    exit 1
}

# Transferir archivos
Write-Host "📤 Transfiriendo archivos..." -ForegroundColor Yellow
$transferCommand = "scp -r ${tempDir}/* ${Username}@${ServerIP}:${TargetPath}/"
Invoke-Expression $transferCommand

if ($LASTEXITCODE -eq 0) {
    Write-Host "🎉 ¡Transferencia completada exitosamente!" -ForegroundColor Green
    
    # Hacer ejecutables los scripts
    Write-Host "🔧 Configurando permisos..." -ForegroundColor Yellow
    $chmodCommand = "ssh ${Username}@${ServerIP} 'cd $TargetPath && chmod +x *.sh'"
    Invoke-Expression $chmodCommand
    
    Write-Host "📋 Próximos pasos en el servidor:" -ForegroundColor Blue
    Write-Host "   1. Conectar: ssh ${Username}@${ServerIP}" -ForegroundColor Cyan
    Write-Host "   2. Navegar: cd $TargetPath" -ForegroundColor Cyan
    Write-Host "   3. Setup: ./setup-ubuntu.sh" -ForegroundColor Cyan
    Write-Host "   4. Configurar: nano .env.local" -ForegroundColor Cyan
    Write-Host "   5. Iniciar: ./docker.sh dev" -ForegroundColor Cyan
    
} else {
    Write-Host "❌ Error durante la transferencia" -ForegroundColor Red
}

# Limpiar archivos temporales
Remove-Item $tempDir -Recurse -Force
Remove-Item $excludeFile -Force

Write-Host "🧹 Archivos temporales limpiados" -ForegroundColor Green