# Script PowerShell para resetear estadísticas de TicketWise
param(
    [switch]$KeepAdminUsers,  # Mantener usuarios admin
    [switch]$ConfirmReset     # Confirmar antes de ejecutar
)

Write-Host "🗑️  RESET DE ESTADÍSTICAS - TICKETWISE" -ForegroundColor Red
Write-Host "=======================================" -ForegroundColor Red

if (-not $ConfirmReset) {
    Write-Host "⚠️  ADVERTENCIA: Este script eliminará:" -ForegroundColor Yellow
    Write-Host "   • Todas las entradas (tickets)" -ForegroundColor Yellow
    Write-Host "   • Todas las órdenes (orders)" -ForegroundColor Yellow
    Write-Host "   • Todos los ingresos" -ForegroundColor Yellow
    Write-Host "   • Todas las estadísticas" -ForegroundColor Yellow
    Write-Host ""
    $confirm = Read-Host "¿Estás seguro? Escribe 'RESET' para continuar"
    
    if ($confirm -ne "RESET") {
        Write-Host "❌ Operación cancelada" -ForegroundColor Red
        exit 1
    }
}

Write-Host "🔄 Ejecutando reset de estadísticas..." -ForegroundColor Blue

# Ejecutar el script SQL usando Node.js
$nodeScript = @"
const { createClient } = require('@supabase/supabase-js');
const config = require('./src/config/index.ts');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function resetStats() {
  try {
    console.log('🗑️  Eliminando tickets...');
    const { error: ticketsError } = await supabase
      .from('tickets')
      .delete()
      .neq('id', '');
    
    if (ticketsError) throw ticketsError;
    console.log('✅ Tickets eliminados');

    console.log('🗑️  Eliminando órdenes...');
    const { error: ordersError } = await supabase
      .from('orders')
      .delete()
      .neq('id', '');
    
    if (ordersError) throw ordersError;
    console.log('✅ Órdenes eliminadas');

    // Verificar resultados
    console.log('\n📊 Verificando estadísticas...');
    
    const { count: ticketCount } = await supabase
      .from('tickets')
      .select('*', { count: 'exact', head: true });
    
    const { count: orderCount } = await supabase
      .from('orders')
      .select('*', { count: 'exact', head: true });
    
    const { count: userCount } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true });

    console.log('📈 ESTADÍSTICAS ACTUALES:');
    console.log(`   • Tickets: ${ticketCount || 0}`);
    console.log(`   • Órdenes: ${orderCount || 0}`);
    console.log(`   • Usuarios: ${userCount || 0}`);
    
    if ((ticketCount || 0) === 0 && (orderCount || 0) === 0) {
      console.log('\n🎉 ¡Reset completado exitosamente!');
      console.log('💰 Ingresos: $0');
      console.log('🎫 Entradas vendidas: 0');
      console.log('📝 Entradas generadas: 0');
    } else {
      console.log('\n⚠️  Reset parcial - revisar manualmente');
    }

  } catch (error) {
    console.error('❌ Error durante el reset:', error.message);
    process.exit(1);
  }
}

resetStats();
"@

# Escribir script temporal
$nodeScript | Out-File -FilePath "temp-reset.js" -Encoding utf8

try {
    # Ejecutar reset
    node temp-reset.js
    
    Write-Host ""
    Write-Host "✅ Reset de estadísticas completado" -ForegroundColor Green
    Write-Host "🎯 Tu aplicación ahora muestra:" -ForegroundColor Cyan
    Write-Host "   💰 Ingresos: `$0" -ForegroundColor Cyan
    Write-Host "   🎫 Entradas vendidas: 0" -ForegroundColor Cyan
    Write-Host "   📝 Entradas generadas: 0" -ForegroundColor Cyan
    Write-Host "   📋 Órdenes pendientes: 0" -ForegroundColor Cyan
    
} catch {
    Write-Host "❌ Error ejecutando reset: $_" -ForegroundColor Red
    exit 1
} finally {
    # Limpiar archivo temporal
    if (Test-Path "temp-reset.js") {
        Remove-Item "temp-reset.js" -Force
    }
}

Write-Host ""
Write-Host "📋 Próximos pasos:" -ForegroundColor Blue
Write-Host "   1. npm run dev  # Verificar que stats muestren 0" -ForegroundColor White
Write-Host "   2. Probar funcionalidad básica" -ForegroundColor White
Write-Host "   3. Deploy a Hostinger cuando esté listo" -ForegroundColor White