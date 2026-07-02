# Script de Diagnóstico de Performance - TicketWise
param(
    [Parameter()]
    [string]$Url = "http://localhost:9002",
    
    [Parameter()]
    [int]$Tests = 5
)

Write-Host "🔍 Diagnósticando performance de TicketWise..." -ForegroundColor Blue
Write-Host "URL: $Url" -ForegroundColor Cyan
Write-Host "Tests: $Tests" -ForegroundColor Cyan

# Función para medir tiempo de respuesta
function Test-PageLoad {
    param($Url, $TestName)
    
    try {
        $stopwatch = [System.Diagnostics.Stopwatch]::StartNew()
        $response = Invoke-WebRequest -Uri $Url -Method GET -UseBasicParsing -TimeoutSec 30
        $stopwatch.Stop()
        
        $statusColor = if ($response.StatusCode -eq 200) { "Green" } else { "Red" }
        Write-Host "✅ $TestName`: $($stopwatch.ElapsedMilliseconds)ms (Status: $($response.StatusCode))" -ForegroundColor $statusColor
        return $stopwatch.ElapsedMilliseconds
    } catch {
        Write-Host "❌ $TestName`: ERROR - $($_.Exception.Message)" -ForegroundColor Red
        return -1
    }
}

# Esperar a que el servidor esté listo
Write-Host "⏳ Esperando a que el servidor esté listo..." -ForegroundColor Yellow
$ready = $false
$attempts = 0
$maxAttempts = 20

while (-not $ready -and $attempts -lt $maxAttempts) {
    try {
        $response = Invoke-WebRequest -Uri $Url -Method GET -UseBasicParsing -TimeoutSec 5 -ErrorAction Stop
        $ready = $true
        Write-Host "✅ Servidor listo!" -ForegroundColor Green
    } catch {
        $attempts++
        Write-Host "⏳ Intento $attempts/$maxAttempts..." -ForegroundColor Yellow
        Start-Sleep 2
    }
}

if (-not $ready) {
    Write-Host "❌ El servidor no está respondiendo después de $maxAttempts intentos" -ForegroundColor Red
    exit 1
}

# Tests de performance
Write-Host "`n🚀 Ejecutando tests de performance..." -ForegroundColor Blue

$times = @()

# Test página principal
for ($i = 1; $i -le $Tests; $i++) {
    $time = Test-PageLoad "$Url" "Home $i"
    if ($time -gt 0) {
        $times += $time
    }
    Start-Sleep 1
}

# Test rutas específicas
$routes = @(
    "/login",
    "/dashboard", 
    "/events/1"
)

foreach ($route in $routes) {
    $time = Test-PageLoad "$Url$route" $route
    if ($time -gt 0) {
        $times += $time
    }
    Start-Sleep 1
}

# Análisis de resultados
if ($times.Count -gt 0) {
    $avgTime = ($times | Measure-Object -Average).Average
    $minTime = ($times | Measure-Object -Minimum).Minimum
    $maxTime = ($times | Measure-Object -Maximum).Maximum
    
    Write-Host "`n📊 Resultados:" -ForegroundColor Blue
    Write-Host "   Promedio: $([math]::Round($avgTime, 2))ms" -ForegroundColor Cyan
    Write-Host "   Mínimo:   ${minTime}ms" -ForegroundColor Green
    Write-Host "   Máximo:   ${maxTime}ms" -ForegroundColor Yellow
    
    # Evaluación
    if ($avgTime -lt 1000) {
        Write-Host "✅ Performance EXCELENTE (< 1s)" -ForegroundColor Green
    } elseif ($avgTime -lt 3000) {
        Write-Host "🟡 Performance BUENA (1-3s)" -ForegroundColor Yellow
    } elseif ($avgTime -lt 5000) {
        Write-Host "🟠 Performance REGULAR (3-5s)" -ForegroundColor DarkYellow
    } else {
        Write-Host "❌ Performance LENTA (> 5s)" -ForegroundColor Red
        Write-Host "💡 Sugerencias:" -ForegroundColor Yellow
        Write-Host "   - Deshabilitar middleware en desarrollo" -ForegroundColor White
        Write-Host "   - Simplificar next.config.ts" -ForegroundColor White
        Write-Host "   - Revisar hooks de performance" -ForegroundColor White
    }
} else {
    Write-Host "❌ No se pudieron obtener métricas válidas" -ForegroundColor Red
}

Write-Host "`n🔧 Para mejorar performance:" -ForegroundColor Blue
Write-Host "   1. Middleware simplificado ✅" -ForegroundColor Green
Write-Host "   2. Next.config optimizado ✅" -ForegroundColor Green
Write-Host "   3. Cache limpiado ✅" -ForegroundColor Green
Write-Host "   4. Proceso Node.js reiniciado ✅" -ForegroundColor Green