# Cómo Compartir tu Proyecto Local con un Enlace Temporal (usando ngrok)

Esta guía te enseñará a exponer tu servidor de desarrollo local (que corre en `localhost`) a internet usando un enlace público y temporal. Esto es ideal para probar tu proyecto en otros dispositivos (como un teléfono) o para mostrar tu progreso a alguien más.

### ¿Qué es un Túnel y por qué lo necesito?

Cuando ejecutas tu proyecto con `npm run dev`, se inicia en una dirección como `http://localhost:3000`. Esta dirección solo es accesible desde tu propia computadora. Un servicio de túnel como **ngrok** crea un "pasadizo" seguro desde tu `localhost` a una URL pública en internet (ej: `https://aleatorio.ngrok.io`), permitiendo que cualquiera con el enlace pueda ver tu proyecto.

---

### Guía Paso a Paso

#### Paso 1: Mantén tu Proyecto Corriendo

Abre una terminal en la carpeta de tu proyecto y ejecuta tu servidor de desarrollo como siempre.

```sh
npm run dev
```

Fíjate en el puerto que está usando. Generalmente es el **3000**. No cierres esta terminal.

#### Paso 2: Descarga ngrok

1.  Ve a la página oficial de ngrok: [https://ngrok.com/download](https://ngrok.com/download)
2.  Descarga la versión para tu sistema operativo (Windows).
3.  Descomprime el archivo ZIP. Obtendrás un único archivo ejecutable: `ngrok.exe`.

#### Paso 3: Autentica ngrok (Recomendado)

Este paso es opcional pero muy recomendado para eliminar límites de tiempo en la sesión gratuita.

1.  Regístrate para obtener una cuenta gratuita en [ngrok.com](https://ngrok.com).
2.  En tu dashboard de ngrok, encontrarás tu "Auth Token". Cópialo.
3.  Abre una **nueva terminal** en la carpeta donde descomprimiste `ngrok.exe` y ejecuta el siguiente comando, reemplazando `YOUR_AUTH_TOKEN` con el token que copiaste:

```sh
./ngrok config add-authtoken YOUR_AUTH_TOKEN
```

Solo necesitas hacer esto una vez.

#### Paso 4: Crea el Túnel

En la misma terminal donde tienes `ngrok.exe`, ejecuta el siguiente comando. Si tu proyecto corre en un puerto diferente al 3000, cámbialo.

```sh
./ngrok http 3000
```

#### Paso 5: Obtén y Comparte tu Enlace

Después de ejecutar el comando, ngrok mostrará una interfaz en tu terminal. Busca la línea que dice **"Forwarding"**. Verás una URL que termina en `.ngrok-free.app` o similar.

```
Session Status                online
Account                       Ariel (Plan: Free)
Version                       3.x.x
Region                        United States (us)
Web Interface                 http://127.0.0.1:4040
Forwarding                    https://random-string-123.ngrok-free.app -> http://localhost:3000
```

Esa URL (`https://random-string-123.ngrok-free.app`) es tu enlace público temporal. ¡Puedes abrirla en tu teléfono, compartirla con un cliente o un amigo y verán tu proyecto local en tiempo real!

**Importante:**
-   El enlace es **temporal**. Si cierras la terminal de ngrok, el enlace dejará de funcionar.
-   Cada vez que inicies ngrok, se generará una nueva URL aleatoria.
