/**
 * EJEMPLOS DE USO DE LA NUEVA API PostgreSQL
 * 
 * Este archivo contiene ejemplos de cómo usar el nuevo cliente
 * de PostgreSQL para reemplazar las llamadas de Supabase
 */

import { query, transaction, getClient } from '@/lib/db';

// ====================================
// EJEMPLO 1: Query Simple
// ====================================
export async function getUserByEmail(email: string) {
  const result = await query<User>(
    'SELECT * FROM users WHERE email = $1 LIMIT 1',
    [email]
  );
  
  return result.rows[0] || null;
}

// ====================================
// EJEMPLO 2: Insert con RETURNING
// ====================================
export async function createUser(userData: CreateUserInput) {
  const result = await query<User>(
    `INSERT INTO users (email, password, display_name, role) 
     VALUES ($1, $2, $3, $4) 
     RETURNING *`,
    [userData.email, userData.password, userData.displayName, userData.role || 'user']
  );
  
  return result.rows[0];
}

// ====================================
// EJEMPLO 3: Update
// ====================================
export async function updateUserRole(userId: string, newRole: string) {
  const result = await query<User>(
    `UPDATE users 
     SET role = $1, updated_at = NOW() 
     WHERE id = $2 
     RETURNING *`,
    [newRole, userId]
  );
  
  if (result.rowCount === 0) {
    throw new Error('Usuario no encontrado');
  }
  
  return result.rows[0];
}

// ====================================
// EJEMPLO 4: Delete
// ====================================
export async function deleteOrder(orderId: string) {
  const result = await query(
    'DELETE FROM orders WHERE id = $1',
    [orderId]
  );
  
  return (result.rowCount ?? 0) > 0;
}

// ====================================
// EJEMPLO 5: Query con JOIN
// ====================================
export async function getOrdersWithEventInfo(userId: string) {
  const result = await query<OrderWithEvent>(
    `SELECT 
      o.*,
      e.name as event_name,
      e.event_date,
      tt.name as ticket_type_name,
      tt.price as ticket_price
     FROM orders o
     JOIN events e ON o.event_id = e.id
     LEFT JOIN ticket_types tt ON o.ticket_type_id = tt.id
     WHERE o.user_id = $1
     ORDER BY o.created_at DESC`,
    [userId]
  );
  
  return result.rows;
}

// ====================================
// EJEMPLO 6: Transacción (Crear orden + tickets)
// ====================================
export async function createOrderWithTickets(orderData: CreateOrderInput) {
  return await transaction(async (client) => {
    // 1. Crear la orden
    const orderResult = await client.query<Order>(
      `INSERT INTO orders (
        event_id, ticket_type_id, user_id, user_name, user_email,
        ticket_name, quantity, total_price, receipt_url, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *`,
      [
        orderData.eventId,
        orderData.ticketTypeId,
        orderData.userId,
        orderData.userName,
        orderData.userEmail,
        orderData.ticketName,
        orderData.quantity,
        orderData.totalPrice,
        orderData.receiptUrl,
        'pending'
      ]
    );
    
    const order = orderResult.rows[0];
    
    // 2. Generar los tickets (solo si la orden está aprobada)
    if (orderData.autoApprove) {
      const ticketPromises = [];
      for (let i = 0; i < orderData.quantity; i++) {
        ticketPromises.push(
          client.query<Ticket>(
            `INSERT INTO tickets (
              event_id, order_id, user_id, user_name, ticket_type_name, status
            ) VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING *`,
            [
              orderData.eventId,
              order.id,
              orderData.userId,
              orderData.userName,
              orderData.ticketName,
              'verified'
            ]
          )
        );
      }
      
      const ticketResults = await Promise.all(ticketPromises);
      const tickets = ticketResults.map(r => r.rows[0]);
      
      return { order, tickets };
    }
    
    return { order, tickets: [] };
  });
}

// ====================================
// EJEMPLO 7: Paginación
// ====================================
export async function getEventsPaginated(page = 1, limit = 10) {
  const offset = (page - 1) * limit;
  
  // Obtener total de registros
  const countResult = await query<{ count: string }>(
    'SELECT COUNT(*) as count FROM events WHERE status = $1',
    ['active']
  );
  const totalCount = parseInt(countResult.rows[0].count);
  
  // Obtener página de resultados
  const result = await query<Event>(
    `SELECT * FROM events 
     WHERE status = $1 
     ORDER BY created_at DESC 
     LIMIT $2 OFFSET $3`,
    ['active', limit, offset]
  );
  
  return {
    data: result.rows,
    pagination: {
      page,
      limit,
      totalCount,
      totalPages: Math.ceil(totalCount / limit)
    }
  };
}

// ====================================
// EJEMPLO 8: Filtros Dinámicos
// ====================================
export async function searchOrders(filters: OrderFilters) {
  const conditions: string[] = ['1=1']; // Siempre verdadero
  const params: any[] = [];
  let paramIndex = 1;
  
  if (filters.eventId) {
    conditions.push(`event_id = $${paramIndex}`);
    params.push(filters.eventId);
    paramIndex++;
  }
  
  if (filters.status) {
    conditions.push(`status = $${paramIndex}`);
    params.push(filters.status);
    paramIndex++;
  }
  
  if (filters.userEmail) {
    conditions.push(`user_email ILIKE $${paramIndex}`);
    params.push(`%${filters.userEmail}%`);
    paramIndex++;
  }
  
  if (filters.dateFrom) {
    conditions.push(`created_at >= $${paramIndex}`);
    params.push(filters.dateFrom);
    paramIndex++;
  }
  
  const whereClause = conditions.join(' AND ');
  
  const result = await query<Order>(
    `SELECT * FROM orders WHERE ${whereClause} ORDER BY created_at DESC`,
    params
  );
  
  return result.rows;
}

// ====================================
// EJEMPLO 9: Estadísticas Agregadas
// ====================================
export async function getEventStatistics(eventId: string) {
  const result = await query<EventStats>(
    `SELECT 
      COUNT(DISTINCT o.id) as total_orders,
      COUNT(DISTINCT CASE WHEN o.status = 'approved' THEN o.id END) as approved_orders,
      COUNT(DISTINCT t.id) as total_tickets,
      COUNT(DISTINCT CASE WHEN t.status = 'used' THEN t.id END) as used_tickets,
      COALESCE(SUM(CASE WHEN o.status = 'approved' THEN o.total_price END), 0) as total_revenue,
      COALESCE(AVG(CASE WHEN o.status = 'approved' THEN o.total_price END), 0) as avg_order_value
     FROM events e
     LEFT JOIN orders o ON e.id = o.event_id
     LEFT JOIN tickets t ON e.id = t.event_id
     WHERE e.id = $1
     GROUP BY e.id`,
    [eventId]
  );
  
  return result.rows[0];
}

// ====================================
// EJEMPLO 10: Validar Ticket (QR Scanner)
// ====================================
export async function validateTicket(ticketId: string, validatorId: string) {
  return await transaction(async (client) => {
    // 1. Verificar que el ticket existe y está en estado 'verified'
    const ticketResult = await client.query<Ticket>(
      'SELECT * FROM tickets WHERE id = $1 FOR UPDATE',
      [ticketId]
    );
    
    if (ticketResult.rowCount === 0) {
      throw new Error('Ticket no encontrado');
    }
    
    const ticket = ticketResult.rows[0];
    
    if (ticket.status !== 'verified') {
      throw new Error(`Ticket ya fue usado el ${ticket.used_at}`);
    }
    
    // 2. Marcar ticket como usado
    const updateResult = await client.query<Ticket>(
      `UPDATE tickets 
       SET status = 'used', 
           used_at = NOW(), 
           validated_by = $1 
       WHERE id = $2 
       RETURNING *`,
      [validatorId, ticketId]
    );
    
    return updateResult.rows[0];
  });
}

// ====================================
// EJEMPLO 11: Obtener Tickets de Usuario
// ====================================
export async function getUserTickets(userId: string) {
  const result = await query<TicketWithDetails>(
    `SELECT 
      t.*,
      e.name as event_name,
      e.event_date,
      e.location,
      o.receipt_url
     FROM tickets t
     JOIN events e ON t.event_id = e.id
     LEFT JOIN orders o ON t.order_id = o.id
     WHERE t.user_id = $1
     ORDER BY e.event_date ASC, t.created_at DESC`,
    [userId]
  );
  
  return result.rows;
}

// ====================================
// EJEMPLO 12: Buscar Eventos Activos
// ====================================
export async function getActiveEvents() {
  const result = await query<EventWithStats>(
    `SELECT 
      e.*,
      COUNT(DISTINCT tt.id) as ticket_types_count,
      MIN(tt.price) as min_price,
      MAX(tt.price) as max_price
     FROM events e
     LEFT JOIN ticket_types tt ON e.id = tt.event_id
     WHERE e.status = 'active' AND e.event_date > NOW()
     GROUP BY e.id
     ORDER BY e.event_date ASC`,
    []
  );
  
  return result.rows;
}

// ====================================
// TIPOS TYPESCRIPT (para los ejemplos)
// ====================================
interface User {
  id: string;
  email: string;
  display_name?: string;
  role: string;
  created_at: Date;
}

interface CreateUserInput {
  email: string;
  password: string;
  displayName?: string;
  role?: string;
}

interface Order {
  id: string;
  event_id: string;
  user_id: string;
  quantity: number;
  total_price: number;
  status: string;
  created_at: Date;
}

interface CreateOrderInput {
  eventId: string;
  ticketTypeId: string;
  userId: string;
  userName: string;
  userEmail: string;
  ticketName: string;
  quantity: number;
  totalPrice: number;
  receiptUrl: string;
  autoApprove?: boolean;
}

interface Ticket {
  id: string;
  event_id: string;
  order_id: string;
  user_id: string;
  status: string;
  used_at?: Date;
}

interface Event {
  id: string;
  name: string;
  event_date: Date;
  status: string;
}

interface OrderFilters {
  eventId?: string;
  status?: string;
  userEmail?: string;
  dateFrom?: Date;
}

interface EventStats {
  total_orders: number;
  approved_orders: number;
  total_tickets: number;
  used_tickets: number;
  total_revenue: number;
  avg_order_value: number;
}

interface OrderWithEvent extends Order {
  event_name: string;
  event_date: Date;
  ticket_type_name: string;
  ticket_price: number;
}

interface TicketWithDetails extends Ticket {
  event_name: string;
  event_date: Date;
  location: string;
  receipt_url?: string;
}

interface EventWithStats extends Event {
  ticket_types_count: number;
  min_price: number;
  max_price: number;
}
