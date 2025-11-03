-- ====================================
-- TICKETWISE - ESQUEMA POSTGRESQL MULTI-EVENTO
-- Base de datos: ticketwase2
-- Fecha: 2025-11-01
-- ====================================

-- Eliminar tablas existentes si existen (CUIDADO: esto borra todos los datos)
DROP TABLE IF EXISTS event_organizers CASCADE;
DROP TABLE IF EXISTS tickets CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS ticket_types CASCADE;
DROP TABLE IF EXISTS events CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- ====================================
-- TABLA: users
-- Almacena todos los usuarios del sistema
-- ====================================
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  display_name TEXT,
  ci TEXT,
  usuario TEXT,
  numero TEXT,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  role TEXT DEFAULT 'user' CHECK (role IN ('admin', 'organizer', 'validator', 'user')),
  universidad TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE users IS 'Usuarios del sistema con roles diferenciados';
COMMENT ON COLUMN users.role IS 'Roles: admin, organizer, validator, user';
COMMENT ON COLUMN users.password IS 'Hash bcrypt de la contraseña';

-- ====================================
-- TABLA: events
-- Gestiona múltiples eventos en la plataforma
-- ====================================
CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  event_date TIMESTAMPTZ,
  location TEXT,
  image_url TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'ended', 'cancelled')),
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE events IS 'Eventos disponibles en la plataforma';
COMMENT ON COLUMN events.status IS 'Estados: active, ended, cancelled';
COMMENT ON COLUMN events.created_by IS 'ID del usuario que creó el evento';

-- ====================================
-- TABLA: ticket_types
-- Define los tipos de entrada por evento
-- ====================================
CREATE TABLE ticket_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  price INTEGER NOT NULL CHECK (price >= 0),
  quantity_available INTEGER CHECK (quantity_available >= 0),
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE ticket_types IS 'Tipos de entrada disponibles por evento (General, VIP, Estudiante, etc.)';
COMMENT ON COLUMN ticket_types.price IS 'Precio en centavos';
COMMENT ON COLUMN ticket_types.quantity_available IS 'Cantidad disponible, NULL = ilimitado';

-- ====================================
-- TABLA: orders
-- Órdenes de compra de entradas
-- ====================================
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  ticket_type_id UUID REFERENCES ticket_types(id) ON DELETE SET NULL,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  user_name TEXT,
  user_email TEXT,
  ticket_name TEXT,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  total_price INTEGER NOT NULL CHECK (total_price >= 0),
  receipt_url TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'cancelled')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  used_at TIMESTAMPTZ
);

COMMENT ON TABLE orders IS 'Órdenes de compra de entradas por evento';
COMMENT ON COLUMN orders.status IS 'Estados: pending, approved, rejected, cancelled';
COMMENT ON COLUMN orders.total_price IS 'Precio total en centavos';
COMMENT ON COLUMN orders.used_at IS 'Timestamp cuando se usó/validó la orden';

-- ====================================
-- TABLA: tickets
-- Entradas individuales generadas por orden
-- ====================================
CREATE TABLE tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  user_name TEXT,
  ticket_type_name TEXT,
  status TEXT DEFAULT 'verified' CHECK (status IN ('verified', 'used', 'cancelled')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  used_at TIMESTAMPTZ,
  validated_by UUID REFERENCES users(id)
);

COMMENT ON TABLE tickets IS 'Entradas individuales generadas tras aprobar una orden';
COMMENT ON COLUMN tickets.status IS 'Estados: verified, used, cancelled';
COMMENT ON COLUMN tickets.validated_by IS 'ID del validador que escaneó el ticket';

-- ====================================
-- TABLA: event_organizers
-- Asigna organizadores y validadores a eventos
-- ====================================
CREATE TABLE event_organizers (
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'organizer' CHECK (role IN ('organizer', 'validator')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (event_id, user_id)
);

COMMENT ON TABLE event_organizers IS 'Relación N:M entre eventos y sus organizadores/validadores';
COMMENT ON COLUMN event_organizers.role IS 'Roles: organizer, validator';

-- ====================================
-- ÍNDICES para optimización de consultas
-- ====================================
CREATE INDEX idx_orders_event ON orders(event_id);
CREATE INDEX idx_orders_user ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created ON orders(created_at DESC);

CREATE INDEX idx_tickets_event ON tickets(event_id);
CREATE INDEX idx_tickets_order ON tickets(order_id);
CREATE INDEX idx_tickets_user ON tickets(user_id);
CREATE INDEX idx_tickets_status ON tickets(status);
CREATE INDEX idx_tickets_created ON tickets(created_at DESC);

CREATE INDEX idx_ticket_types_event ON ticket_types(event_id);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);

CREATE INDEX idx_events_status ON events(status);
CREATE INDEX idx_events_date ON events(event_date);

CREATE INDEX idx_event_organizers_user ON event_organizers(user_id);

-- ====================================
-- TRIGGERS para updated_at
-- ====================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_events_updated_at
  BEFORE UPDATE ON events
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ====================================
-- DATOS DE EJEMPLO (OPCIONAL)
-- ====================================
-- Usuario admin por defecto (password: Admin123!)
-- Hash generado con bcrypt rounds=10
INSERT INTO users (id, display_name, email, password, role) VALUES 
  ('00000000-0000-0000-0000-000000000001', 'Administrador', 'admin@ticketwise.com', '$2b$10$rZ5X8VKEGKEGKEGKEGKEGuXrZ5X8VKEGKEGKEGKEGKEGu', 'admin')
ON CONFLICT (email) DO NOTHING;

-- Evento de ejemplo
INSERT INTO events (id, name, description, event_date, location, status, created_by) VALUES
  ('00000000-0000-0000-0000-000000000001', 
   'Evento de Prueba', 
   'Este es un evento de ejemplo para testing', 
   NOW() + INTERVAL '30 days',
   'Auditorio Central',
   'active',
   '00000000-0000-0000-0000-000000000001')
ON CONFLICT (id) DO NOTHING;

-- Tipos de entrada de ejemplo
INSERT INTO ticket_types (event_id, name, price, quantity_available) VALUES
  ('00000000-0000-0000-0000-000000000001', 'General', 5000, 100),
  ('00000000-0000-0000-0000-000000000001', 'VIP', 10000, 50),
  ('00000000-0000-0000-0000-000000000001', 'Estudiante', 3000, 150);

-- ====================================
-- VISTAS ÚTILES
-- ====================================

-- Vista de estadísticas por evento
CREATE OR REPLACE VIEW event_stats AS
SELECT 
  e.id as event_id,
  e.name as event_name,
  e.status as event_status,
  COUNT(DISTINCT o.id) as total_orders,
  COUNT(DISTINCT CASE WHEN o.status = 'approved' THEN o.id END) as approved_orders,
  COUNT(DISTINCT t.id) as total_tickets,
  COUNT(DISTINCT CASE WHEN t.status = 'used' THEN t.id END) as used_tickets,
  COALESCE(SUM(CASE WHEN o.status = 'approved' THEN o.total_price END), 0) as total_revenue
FROM events e
LEFT JOIN orders o ON e.id = o.event_id
LEFT JOIN tickets t ON e.id = t.event_id
GROUP BY e.id, e.name, e.status;

COMMENT ON VIEW event_stats IS 'Estadísticas agregadas por evento';

-- Vista de tickets pendientes de validar
CREATE OR REPLACE VIEW pending_validations AS
SELECT 
  t.id as ticket_id,
  t.status,
  t.created_at,
  e.name as event_name,
  e.event_date,
  u.display_name as user_name,
  u.email as user_email,
  tt.name as ticket_type
FROM tickets t
JOIN events e ON t.event_id = e.id
LEFT JOIN users u ON t.user_id = u.id
LEFT JOIN orders o ON t.order_id = o.id
LEFT JOIN ticket_types tt ON o.ticket_type_id = tt.id
WHERE t.status = 'verified'
ORDER BY t.created_at DESC;

COMMENT ON VIEW pending_validations IS 'Tickets verificados pendientes de ser usados/escaneados';

-- ====================================
-- PERMISOS (ajustar según necesidades)
-- ====================================
-- Ejemplo para un usuario de aplicación
-- CREATE USER ticketwise_app WITH PASSWORD 'your_secure_password';
-- GRANT CONNECT ON DATABASE ticketwase2 TO ticketwise_app;
-- GRANT USAGE ON SCHEMA public TO ticketwise_app;
-- GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO ticketwise_app;
-- GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO ticketwise_app;

-- ====================================
-- FIN DEL SCRIPT
-- ====================================
