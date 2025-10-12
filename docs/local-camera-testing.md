# Cómo usar la cámara en tu teléfono para pruebas locales (HTTP)

### El Problema: Contextos Seguros

Los navegadores modernos, por seguridad, solo permiten el acceso a la cámara en páginas web que se sirven a través de una conexión segura (HTTPS).

Sin embargo, hacen una excepción para `http://localhost`, considerándolo un entorno de desarrollo seguro. Por eso la cámara funciona en tu computadora pero no en tu teléfono cuando accedes a través de la IP local (ej: `http://192.168.1.10:9002`), ya que esta última no se considera segura.

### La Solución: Habilitar una bandera en Chrome (Android)

Para tus pruebas de desarrollo, puedes indicarle a Chrome en tu teléfono que trate la dirección de tu computadora como si fuera segura.

**Sigue estos pasos en el navegador Chrome de tu teléfono Android:**

1.  **Abre Chrome** en tu teléfono.
2.  En la barra de direcciones, escribe `chrome://flags` y presiona Enter.
3.  En la barra de búsqueda que aparece dentro de la página de "Experiments", busca la siguiente opción:
    `Insecure origins treated as secure`
4.  En el cuadro de texto debajo de esa opción, ingresa la dirección de tu servidor de desarrollo. Debe incluir el `http://` y el puerto.
    -   **Ejemplo:** `http://192.168.0.11:9002`
    *(Reemplaza `192.168.0.11` con la IP local de tu computadora).*
5.  Una vez ingresada la dirección, cambia el menú desplegable de "Default" a **"Enabled"**.
6.  Aparecerá un botón azul en la parte inferior que dice **"Relaunch"**. Púlsalo para reiniciar Chrome.

¡Listo! Ahora, cuando accedas a `http://192.168.0.11:9002` desde tu teléfono, Chrome tratará la página como segura y te permitirá usar la cámara para escanear los códigos QR.

### Advertencia Importante

-   Esta configuración es **solo para desarrollo**.
-   Cuando termines tus pruebas, es recomendable volver a `chrome://flags`, buscar la misma opción y cambiarla de nuevo a "Default" para restaurar la configuración de seguridad normal.
-   Para que tu aplicación funcione en **producción**, deberás alojarla en un servidor que utilice **HTTPS**.
