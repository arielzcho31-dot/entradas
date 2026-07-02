// EJEMPLOS DE USO - Nueva Arquitectura de Seguridad

// ========================================
// 1️⃣ USAR AUTENTICACIÓN EN COMPONENTES
// ========================================

import { useAuth } from '@/context/auth-context';

export function MyComponent() {
  const { user, loading, logout } = useAuth();

  if (loading) return <div>Cargando...</div>;
  if (!user) return <div>No autenticado</div>;

  return (
    <div>
      <p>Bienvenido {user.email}</p>
      <button onClick={logout}>Logout</button>
    </div>
  );
}

// ========================================
// 2️⃣ HACER REQUESTS API SEGUROS
// ========================================

import { useApi } from '@/hooks/use-api';

export function OrdersList() {
  const { request } = useApi();
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const data = await request('/api/orders');
        // Token se envía automáticamente en cookies
        // Si expira, se renueva automáticamente
        setOrders(data.data);
      } catch (error) {
        console.error('Error:', error);
      }
    };

    fetchOrders();
  }, [request]);

  return <div>{orders.map(order => <div key={order.id}>{order.id}</div>)}</div>;
}

// ========================================
// 3️⃣ CREAR NUEVOS ENDPOINTS PROTEGIDOS
// ========================================

// src/app/api/my-resource/route.ts
import { NextRequest } from 'next/server';
import { db } from '@/lib/database';
import { apiSuccess, apiError } from '@/lib/api-utils';
import { verifyAuthFromRequest } from '@/lib/auth-utils';
import { createResourceSchema } from '@/lib/validators';

export async function POST(req: NextRequest) {
  try {
    // 1. Verificar autenticación
    const auth = await verifyAuthFromRequest(req);
    if (!auth) return apiError('Unauthorized', 401);

    // 2. Validar input
    const body = await req.json();
    const validation = createResourceSchema.safeParse(body);
    if (!validation.success) {
      return apiError('Validation failed', 400);
    }

    // 3. Operación en BD
    const result = await db.query(
      'INSERT INTO my_table (user_id, ...) VALUES ($1, ...) RETURNING *',
      [auth.userId, ...] // Usar auth.userId del token
    );

    // 4. Respuesta exitosa
    return apiSuccess(result.rows[0], 201);

  } catch (error) {
    console.error('API error:', error);
    return apiError('Server error', 500);
  }
}

// ========================================
// 4️⃣ PROTEGER RUTAS EN COMPONENTES
// ========================================

import { useAuth } from '@/context/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export function AdminPanel() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && (!user || user.role !== 'admin')) {
      router.push('/dashboard'); // Redirigir si no es admin
    }
  }, [user, loading, router]);

  if (loading || !user || user.role !== 'admin') {
    return <div>Acceso denegado</div>;
  }

  return <div>Panel Admin</div>;
}

// ========================================
// 5️⃣ LOGIN FORM (Actualizado)
// ========================================

import { useAuth } from '@/context/auth-context';
import { useState } from 'react';

export function LoginForm() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const result = await login(email, password);
    if (!result) {
      setError('Email o contraseña incorrectos');
    }
    // Si es exitoso, login() maneja redirección automática
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Contraseña"
      />
      {error && <p className="text-red-500">{error}</p>}
      <button type="submit">Iniciar Sesión</button>
    </form>
  );
}

// ========================================
// 6️⃣ VERIFICAR ROL EN MIDDLEWARE
// ========================================

// El middleware (src/middleware.ts) automáticamente:
// 1. Verifica si está autenticado
// 2. Redirige a /login si no hay token
// 3. Verifica rol para rutas admin/validator
// 4. Agrega headers X-User-Id y X-User-Role

// Usa en API si necesitas:
export async function GET(req: NextRequest) {
  const userId = req.headers.get('X-User-Id');
  const userRole = req.headers.get('X-User-Role');
  
  // Acceso de solo-lectura para usuarios
  if (userRole === 'user') {
    // ... lógica limitada
  }
}

// ========================================
// 7️⃣ MANEJO DE ERRORES ESTÁNDAR
// ========================================

export async function POST(req: NextRequest) {
  try {
    const auth = await verifyAuthFromRequest(req);
    if (!auth) return apiError('No autorizado', 401);

    const body = await req.json();
    const validation = mySchema.safeParse(body);
    
    if (!validation.success) {
      // Validación fallida
      return apiError('Datos inválidos', 400);
    }

    // Intenta operación
    const result = await risky Operation();
    return apiSuccess(result);

  } catch (error) {
    // ❌ NO DEVOLVER ERROR DETALLADO
    // console.error(error); // OK en servidor
    // return Response.json(error); // ❌ NUNCA
    
    // ✅ RESPUESTA GENÉRICA AL CLIENTE
    return apiError('Error interno del servidor', 500);
  }
}

// ========================================
// 8️⃣ TRANSACCIÓN SEGURA
// ========================================

export async function POST(req: NextRequest) {
  try {
    const auth = await verifyAuthFromRequest(req);
    if (!auth) return apiError('Unauthorized', 401);

    const body = await req.json();
    const validation = buyTicketsSchema.safeParse(body);
    if (!validation.success) return apiError('Invalid', 400);

    // TRANSACCIÓN - TODO SE EJECUTA O NADA
    const client = await db.connect();
    try {
      await client.query('BEGIN');

      // 1. Crear orden
      const orderResult = await client.query(
        'INSERT INTO orders (user_id, total) VALUES ($1, $2) RETURNING id',
        [auth.userId, validation.data.total]
      );
      const orderId = orderResult.rows[0].id;

      // 2. Crear tickets
      for (const ticket of validation.data.tickets) {
        await client.query(
          'INSERT INTO tickets (order_id, qr_code) VALUES ($1, $2)',
          [orderId, generateQRCode()]
        );
      }

      // 3. Actualizar usuario
      await client.query(
        'UPDATE users SET tickets_purchased = tickets_purchased + 1 WHERE id = $1',
        [auth.userId]
      );

      // TODO OK - CONFIRMAR
      await client.query('COMMIT');

      return apiSuccess({ orderId });

    } catch (error) {
      // ERROR - REVERTIR TODO
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }

  } catch (error) {
    console.error('Purchase error:', error);
    return apiError('Error al procesar compra', 500);
  }
}

// ========================================
// 9️⃣ TESTING DE ENDPOINTS
// ========================================

// Test: Login exitoso
async function testLogin() {
  const response = await fetch('http://localhost:9004/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'user@example.com',
      password: 'password123'
    }),
    credentials: 'include' // Importante: guardar cookies
  });

  const data = await response.json();
  console.log('Login response:', data);
  // Resultado: { success: true, data: { id, email, role, ... } }
}

// Test: Acceso a endpoint protegido
async function testProtectedEndpoint() {
  const response = await fetch('http://localhost:9004/api/orders', {
    credentials: 'include' // Enviar cookies
  });

  const data = await response.json();
  console.log('Orders:', data);
  // Si sin token: { success: false, error: 'Unauthorized' }
  // Si con token: { success: true, data: [...] }
}

// ========================================
// 🔟 VARIABLES DE ENTORNO CORRECTAS
// ========================================

// .env.local (NO COMMITEAR)
// DATABASE_URL=postgresql://user:password@localhost:5432/ticketwise
// JWT_SECRET=<generateSecret()>
// REFRESH_TOKEN_SECRET=<generateSecret()>
// NODE_ENV=development
// NEXT_PUBLIC_APP_URL=http://localhost:9004

// .env.example (COMMITEAR - sin valores)
// DATABASE_URL=postgresql://...
// JWT_SECRET=cambiar-en-produccion
// REFRESH_TOKEN_SECRET=cambiar-en-produccion
