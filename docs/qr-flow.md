# Flujo de Verificación de Entradas con QR

Este documento explica cómo se vincula un código QR a un usuario con pago confirmado y cómo funciona el proceso de escaneo.

### 1. ¿Qué contiene el Código QR?

El código QR no es más que una representación visual de un texto. En nuestro caso, el texto que contiene el QR es el **ID único de la orden** (el `id` de la tabla `orders`).

-   **Ejemplo:** Cuando un usuario compra una entrada y el pago es verificado, se crea una orden con `id: "a1b2-c3d4-e5f6"`. El QR que se le envía al usuario simplemente contiene el texto "a1b2-c3d4-e5f6".

### 2. Proceso de Vinculación (Flujo de Datos)

La vinculación entre el QR, el usuario y el pago ya existe en tu base de datos:

1.  **Usuario compra:** Un usuario (de la tabla `users`) realiza una compra.
2.  **Se crea la orden:** Se crea una fila en la tabla `orders` que contiene:
    -   `id`: El identificador único de esta orden (será el contenido del QR).
    -   `userId`: La llave foránea que lo vincula al usuario que compró.
    -   `status`: `'pending'`.
3.  **Validador aprueba:** Un validador aprueba el comprobante. El `status` de la orden cambia a `'verified'`.
4.  **Se genera el QR:** En este punto, ya puedes generar el QR con el `id` de la orden y enviárselo al usuario.

### 3. Proceso de Escaneo (Panel del Organizador)

Cuando el organizador escanea el QR en el evento:

1.  **Lectura del QR:** El escáner lee el texto del QR (ej: "a1b2-c3d4-e5f6").
2.  **Verificación:** La función `handleVerification` en tu panel de organizador hace una consulta a la tabla `orders` buscando una fila donde `id` sea igual al texto escaneado.
3.  **Comprobación de Estado:**
    -   **Si `status` es `'verified'`:** ¡Éxito! La entrada es válida. Se actualiza el `status` a `'used'` y se guarda la fecha en la columna `used_at`.
    -   **Si `status` es `'used'`:** ¡Alerta! La entrada ya fue usada. Se muestra un mensaje de advertencia.
    -   **Si `status` es `'pending'` o `'rejected'`:** ¡Error! La entrada no es válida para el acceso.
    -   **Si no se encuentra la orden:** ¡Error! El QR es inválido.

### 4. Sobre la columna `used_at`

-   **¿Debe ser texto?** No. Su tipo de dato correcto es `TIMESTAMPTZ` (Timestamp with Time Zone), que es el tipo que te recomendé. Esto te permite guardar la fecha y hora exactas del escaneo.
-   **¿Necesita llave foránea?** No. Es simplemente un campo en la tabla `orders` para registrar *cuándo* se usó esa orden/entrada específica. No necesita vincularse a ninguna otra tabla.

**En resumen: El `id` de la orden es el corazón de todo el sistema. Actúa como el puente entre el mundo físico (el QR) y tus datos (el usuario y el estado del pago).**
