# Guía de Optimización, Seguridad y Despliegue

Esta guía cubre los pasos finales para optimizar tu aplicación, hacerla más segura y desplegarla en un dominio web.

---

## 1. Optimización (Para 100+ Usuarios Simultáneos)

Para manejar concurrencia, la clave es una base de datos rápida y un frontend eficiente.

### A. Índices en la Base de Datos (¡MUY IMPORTANTE!)

Un índice es como el índice de un libro: permite a la base de datos encontrar datos rápidamente sin tener que leer toda la tabla. Esto es **crucial** para el rendimiento.

**Acción:** Ejecuta los siguientes comandos en el **SQL Editor** de tu panel de Supabase.

```sql
-- Crea un índice en la tabla 'orders' para buscar rápidamente por estado.
CREATE INDEX idx_orders_status ON orders(status);

-- Crea un índice en la tabla 'tickets' para buscar rápidamente los tickets de un usuario.
CREATE INDEX idx_tickets_user_id ON tickets(user_id);

-- Crea un índice en la tabla 'users' para buscar rápidamente por email (esencial para el login).
CREATE INDEX idx_users_email ON users(email);
```

### B. Optimización de la Aplicación

-   **Imágenes:** Ya estás usando el componente `<Image>` de Next.js, lo cual es excelente. Este componente optimiza, redimensiona y sirve imágenes en formatos modernos (como WebP) automáticamente.
-   **Memoización:** Ya hemos usado `useCallback` y `useMemo` para estabilizar componentes y evitar re-renderizados innecesarios, lo cual es una práctica clave para el rendimiento.

---

## 2. Seguridad (Prevención de Ataques)

La seguridad es un proceso continuo, pero estos son los pasos fundamentales.

### A. Variables de Entorno (¡CRÍTICO!)

Nunca debes tener claves secretas (como tu `SUPABASE_SERVICE_ROLE_KEY`) directamente en el código. Deben estar en variables de entorno.

**Acción:**

1.  Crea un archivo llamado `.env.local` en la raíz de tu proyecto (al mismo nivel que `package.json`).
2.  Añade tus claves a este archivo:

    ```env
    # .env.local
    NEXT_PUBLIC_SUPABASE_URL=https://dpgixsgabjvffuwrnhim.supabase.co
    NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRwZ2l4c2dhYmp2ZmZ1d3JuaGltIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk2ODczOTcsImV4cCI6MjA3NTI2MzM5N30.DlVOnxDnRWdAnWpVfTPno1bPT0srj0WMxPYxkH6UDsE

    # Esta es la clave secreta, NUNCA debe empezar con NEXT_PUBLIC_
    SUPABASE_SERVICE_ROLE_KEY=TU_CLAVE_DE_SERVICIO_SECRETA_AQUI
    ```

3.  Asegúrate de que tu archivo `.gitignore` contenga la línea `.env.local` para que nunca se suba a tu repositorio de Git.

### B. Validación de Entradas en API Routes

Nunca confíes en los datos que vienen del cliente. Valida todo en tus API Routes. La librería `zod` es el estándar de la industria para esto.

**Ejemplo de cómo usar `zod` en tu API de registro:**

1.  Instala zod: `npm install zod`
2.  Aplica la validación:

    ```typescript
    // En /api/auth/register/route.ts
    import { z } from 'zod';

    const registerSchema = z.object({
      email: z.string().email(),
      password: z.string().min(6),
      displayName: z.string().min(2),
      // ...otros campos
    });

    export async function POST(request: NextRequest) {
      try {
        const body = await request.json();
        const validation = registerSchema.safeParse(body);

        if (!validation.success) {
          return NextResponse.json({ error: 'Datos inválidos' }, { status: 400 });
        }
        
        const userData = validation.data;
        // ...resto de tu lógica
      } // ...
    }
    ```

### C. Políticas de Seguridad (RLS) en Supabase

Ya hemos implementado RLS, lo cual es la defensa más fuerte para tu base de datos. Asegúrate de que todas tus tablas tengan RLS habilitado y que las políticas sean lo más restrictivas posible.

---

## 3. Despliegue (Subir a un Dominio Web)

La forma más fácil y recomendada de desplegar una aplicación Next.js es usando **Vercel**, la compañía creadora de Next.js.

### Guía Paso a Paso para Desplegar en Vercel

1.  **Sube tu Proyecto a GitHub:**
    -   Crea un repositorio nuevo en [GitHub](https://github.com).
    -   Sigue las instrucciones para subir tu código. Asegúrate de que el archivo `.env.local` **NO** se suba.

2.  **Crea una Cuenta en Vercel:**
    -   Ve a [vercel.com](https://vercel.com) y regístrate usando tu cuenta de GitHub.

3.  **Importa tu Proyecto:**
    -   En tu dashboard de Vercel, haz clic en "Add New..." -> "Project".
    -   Busca y selecciona el repositorio de GitHub que acabas de crear.
    -   Vercel detectará automáticamente que es un proyecto Next.js.

4.  **Configura las Variables de Entorno:**
    -   Antes de desplegar, ve a la sección "Environment Variables".
    -   Añade las mismas variables que tienes en tu archivo `.env.local` (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, y `SUPABASE_SERVICE_ROLE_KEY`).
    -   **Importante:** Las claves que empiezan con `NEXT_PUBLIC_` estarán disponibles en el navegador, las otras solo en el servidor.

5.  **Despliega:**
    -   Haz clic en el botón "Deploy". Vercel construirá tu proyecto y lo desplegará en una URL temporal (ej: `tu-proyecto.vercel.app`).

6.  **Añade tu Dominio Personalizado:**
    -   Una vez desplegado, ve a la pestaña "Domains" en la configuración de tu proyecto en Vercel.
    -   Añade el dominio que has comprado (ej: `mievento.com`).
    -   Vercel te dará instrucciones para configurar los registros DNS en tu proveedor de dominio (como GoDaddy, Namecheap, etc.). Generalmente, solo necesitas apuntar tu dominio a los servidores de Vercel.

¡Y listo! Con estos pasos, tu aplicación estará optimizada, más segura y funcionando en tu propio dominio web, lista para recibir a tus usuarios.
