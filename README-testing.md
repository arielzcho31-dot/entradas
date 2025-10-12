# Cómo probar tu app en tu red local

Para probar tu aplicación en tu teléfono y computadora simultáneamente, sigue estos pasos:

### 1. Inicia el servidor de desarrollo

Asegúrate de que tu script `dev` en `package.json` esté configurado para ser accesible desde la red (`-H 0.0.0.0`). Luego, ejecuta:

```sh
npm run dev
```

### 2. Encuentra la IP local de tu computadora

-   **En Windows:** Abre `cmd` o `PowerShell` y escribe `ipconfig`. Busca la dirección "IPv4 Address". Generalmente es algo como `192.168.0.X` o `192.168.1.X`.

### 3. Accede desde tu teléfono

1.  Asegúrate de que tu teléfono esté conectado a la **misma red WiFi** que tu computadora.
2.  Abre el navegador en tu teléfono.
3.  Escribe la dirección IP de tu computadora seguida del puerto `9002`.

    **Ejemplo:** `http://192.168.0.11:9002`

Ahora podrás ver y probar tu aplicación en ambos dispositivos al mismo tiempo.
