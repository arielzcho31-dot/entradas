# Script para alternar entre modo desarrollo y producción
param(
    [Parameter(Mandatory=$true)]
    [ValidateSet("dev", "prod")]
    [string]$Mode
)

Write-Host "🔧 Configurando modo: $Mode" -ForegroundColor Blue

if ($Mode -eq "dev") {
    # Modo desarrollo - RÁPIDO
    Write-Host "⚡ Activando modo desarrollo..." -ForegroundColor Yellow
    
    # Deshabilitar middleware
    if (Test-Path "src\middleware.ts") {
        Rename-Item -Path "src\middleware.ts" -NewName "middleware.ts.bak" -Force
        Write-Host "✅ Middleware deshabilitado" -ForegroundColor Green
    }
    
    # Deshabilitar rate-limit
    if (Test-Path "src\lib\rate-limit.ts") {
        Rename-Item -Path "src\lib\rate-limit.ts" -NewName "rate-limit.ts.bak" -Force
        Write-Host "✅ Rate limiting deshabilitado" -ForegroundColor Green
    }
    
    # Limpiar cache
    if (Test-Path ".next") {
        Remove-Item -Recurse -Force .next
        Write-Host "✅ Cache limpiado" -ForegroundColor Green
    }
    
    Write-Host "🚀 Modo desarrollo activado - Performance optimizado" -ForegroundColor Green
    
} elseif ($Mode -eq "prod") {
    # Modo producción - SEGURO
    Write-Host "🔒 Activando modo producción..." -ForegroundColor Yellow
    
    # Habilitar middleware
    if (Test-Path "src\middleware.ts.bak") {
        Rename-Item -Path "src\middleware.ts.bak" -NewName "middleware.ts" -Force
        Write-Host "✅ Middleware habilitado" -ForegroundColor Green
    }
    
    # Habilitar rate-limit
    if (Test-Path "src\lib\rate-limit.ts.bak") {
        Rename-Item -Path "src\lib\rate-limit.ts.bak" -NewName "rate-limit.ts" -Force
        Write-Host "✅ Rate limiting habilitado" -ForegroundColor Green
    }
    
    # Instalar dependencias de producción
    npm install critters --save-dev | Out-Null
    Write-Host "✅ Dependencias de producción instaladas" -ForegroundColor Green
    
    # Limpiar cache
    if (Test-Path ".next") {
        Remove-Item -Recurse -Force .next
        Write-Host "✅ Cache limpiado" -ForegroundColor Green
    }
    
    Write-Host "🔒 Modo producción activado - Seguridad optimizada" -ForegroundColor Green
}

Write-Host "`n📋 Próximo paso:" -ForegroundColor Blue
if ($Mode -eq "dev") {
    Write-Host "   npm run dev  # Desarrollo rápido" -ForegroundColor Cyan
} else {
    Write-Host "   docker-compose up  # Producción con Docker" -ForegroundColor Cyan
}