# Cómo Funciona la Data del Dashboard

Este documento explica por qué "Ingresos Totales" sigue mostrando un valor aunque se haya eliminado la lista de "Ventas Verificadas Recientes" del dashboard.

### Diferencia entre Interfaz (UI) y Base de Datos

-   **Ventas Verificadas Recientes (UI):** La lista que veías en el dashboard era solo una *representación visual* de los datos más recientes de tu base de datos. Cuando la eliminamos, solo quitamos el componente de la interfaz que mostraba esos datos.

-   **Ingresos Totales (Cálculo de la Base de Datos):** Este número se calcula en tiempo real. Tu API (`/api/dashboard/stats`) se conecta a la base de datos de Supabase y suma el `totalPrice` de todas las órdenes que tienen el estado `'verified'` o `'used'`.

**En resumen: Quitar la lista de la pantalla no borra las órdenes de tu base de datos. Los datos siguen existiendo, por lo que el cálculo de ingresos totales es correcto.**

### Cómo Reiniciar los "Ingresos Totales" a Cero

Si quieres reiniciar tus estadísticas para hacer pruebas, necesitas borrar los registros de tus tablas en la base de datos.

**ADVERTENCIA: Esta acción es irreversible. Asegúrate de que realmente quieres borrar los datos.**

Puedes ejecutar estos comandos en el **SQL Editor** de tu panel de Supabase.

#### Opción 1: Borrar TODAS las Órdenes y Entradas

Esto reiniciará todos tus datos de ventas, ingresos y entradas vendidas a cero.

```sql
-- Borra todas las entradas individuales
DELETE FROM tickets;

-- Borra todas las órdenes de compra
DELETE FROM orders;
```

Después de ejecutar esto, actualiza tu dashboard. "Ingresos Totales", "Entradas Vendidas" y "Verificaciones Pendientes" deberían mostrar `0`.

#### Opción 2: Borrar Órdenes Específicas

Si solo quieres eliminar una orden en particular, puedes usar su ID.

```sql
-- Primero, borra las entradas asociadas a esa orden
DELETE FROM tickets WHERE order_id = 'ID_DE_LA_ORDEN_A_BORRAR';

-- Luego, borra la orden principal
DELETE FROM orders WHERE id = 'ID_DE_LA_ORDEN_A_BORRAR';
```
*(Reemplaza `ID_DE_LA_ORDEN_A_BORRAR` con el ID real de la orden que quieres eliminar).*
