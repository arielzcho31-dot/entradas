# TicketWise - Proyecto de Venta de Entradas

Este es un proyecto de aplicación web desarrollado en Firebase Studio, construido con Next.js, React, ShadCN UI, Tailwind CSS y Firebase. La aplicación gestiona la venta de entradas para un evento, incluyendo autenticación de usuarios, roles, verificación de pagos y escaneo de códigos QR.

---

## 🚀 Cómo Empezar (Instrucciones de Instalación Local)

Sigue estos pasos para ejecutar el proyecto en tu propia computadora.

### Requisitos Previos

- [Node.js](httpss://nodejs.org/en/) (versión 18 o superior)
- [npm](httpss://www.npmjs.com/) (generalmente se instala con Node.js)
- Una cuenta de [Firebase](httpss://firebase.google.com/)

### 1. Descomprime el Proyecto

Descomprime el archivo `.zip` que descargaste en una carpeta de tu elección.

### 2. Instala las Dependencias

Abre una terminal o línea de comandos, navega hasta la carpeta donde descomprimiste el proyecto y ejecuta el siguiente comando. Esto descargará e instalará todas las librerías necesarias.

```bash
npm install
```

### 3. Configura tu Proyecto de Firebase

Para que la aplicación se conecte a tu propia base de datos y almacenamiento, necesitas configurar un proyecto en Firebase.

1.  **Crea un proyecto en Firebase:** Ve a la [consola de Firebase](httpss://console.firebase.google.com/), haz clic en "Añadir proyecto" y sigue los pasos.
2.  **Activa los servicios:**
    *   En el menú de la izquierda, ve a **Authentication** -> **Sign-in method** y activa el proveedor **Email/Password**.
    *   Ve a **Firestore Database**, haz clic en "Crear base de datos" y créala en **modo de producción**.
    *   Ve a **Storage** y haz clic en "Comenzar".
3.  **Obtén tus credenciales:**
    *   En la configuración de tu proyecto (haciendo clic en el ícono de engranaje), ve a "Configuración del proyecto".
    *   En la sección "Tus apps", haz clic en el ícono `</>` para registrar una nueva aplicación web.
    *   Firebase te proporcionará un objeto de configuración (`firebaseConfig`). Cópialo.
4.  **Actualiza el archivo de configuración:**
    *   Abre el archivo `src/lib/firebase.ts` en tu editor de código.
    *   Reemplaza el objeto `firebaseConfig` existente con el que acabas de copiar de tu proyecto de Firebase.

### 4. Configura las Reglas de CORS para Storage

Para que los comprobantes de pago se puedan visualizar en la aplicación, debes aplicar las reglas de CORS.

1.  Necesitarás la [CLI de Google Cloud](httpss://cloud.google.com/sdk/docs/install).
2.  Ejecuta el siguiente comando en tu terminal, reemplazando `[YOUR_BUCKET_NAME]` por el nombre de tu bucket de Storage (que suele ser `tu-proyecto-id.appspot.com`):

```bash
gcloud storage buckets update gs://[YOUR_BUCKET_NAME] --cors-file=cors.json
```
> **Nota:** El archivo `cors.json` ya está incluido en el proyecto. Solo necesitas ejecutar el comando.

### 5. Ejecuta la Aplicación

¡Ya está todo listo! Ejecuta el siguiente comando en tu terminal para iniciar el servidor de desarrollo:

```bash
npm run dev
```

Tu aplicación estará disponible en **[http://localhost:9002](http://localhost:9002)**.
tar --exclude=project.tar.gz -czvf project.tar.gz .