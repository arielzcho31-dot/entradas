-- ============================================
-- SCRIPT PARA RESETEAR ESTADÍSTICAS A CERO
-- ============================================
-- Este script limpia TODAS las estadísticas:
-- ✅ Ingresos: 0
-- ✅ Entradas vendidas: 0  
-- ✅ Entradas generadas: 0
-- ✅ Órdenes pendientes: 0
-- ============================================

-- 1. ELIMINAR TODOS LOS TICKETS (entradas vendidas + generadas)
DELETE FROM tickets;

-- 2. ELIMINAR TODAS LAS ÓRDENES (ventas + pendientes)
DELETE FROM orders;

-- 3. OPCIONAL: Mantener usuarios pero resetear estadísticas
-- Si quieres también eliminar usuarios de prueba (CUIDADO!):
-- DELETE FROM users WHERE role != 'admin';

-- ============================================
-- VERIFICACIÓN - Ejecutar después del reset
-- ============================================

-- Verificar que todo esté en 0:
SELECT 'Tickets' as tabla, COUNT(*) as cantidad FROM tickets
UNION ALL
SELECT 'Orders' as tabla, COUNT(*) as cantidad FROM orders
UNION ALL
SELECT 'Users' as tabla, COUNT(*) as cantidad FROM users;

-- ============================================
-- RESULTADO ESPERADO:
-- ============================================
-- Tickets: 0
-- Orders: 0  
-- Users: solo admin(s)
-- ============================================