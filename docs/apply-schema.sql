-- Script para aplicar el esquema a la base de datos ticketwase2
-- Ejecutar: psql -U postgres -d ticketwase2 -f docs/apply-schema.sql

\echo '======================================'
\echo 'TICKETWISE - Aplicando esquema PostgreSQL'
\echo 'Base de datos: ticketwase2'
\echo '======================================'
\echo ''

-- Verificar conexión
SELECT 'Conectado a: ' || current_database() || ' en ' || version();

\echo ''
\echo 'Eliminando tablas existentes...'

DROP TABLE IF EXISTS event_organizers CASCADE;
DROP TABLE IF EXISTS tickets CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS ticket_types CASCADE;
DROP TABLE IF EXISTS events CASCADE;
DROP TABLE IF EXISTS users CASCADE;

\echo 'Tablas eliminadas ✓'
\echo ''
\echo 'Creando tablas...'

-- ====================================
-- TABLA: users
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

\echo '  - users ✓'

-- ====================================
-- TABLA: events
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

\echo '  - events ✓'

-- ====================================
-- TABLA: ticket_types
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

\echo '  - ticket_types ✓'

-- ====================================
-- TABLA: orders
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

\echo '  - orders ✓'

-- ====================================
-- TABLA: tickets
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

\echo '  - tickets ✓'

-- ====================================
-- TABLA: event_organizers
-- ====================================
CREATE TABLE event_organizers (
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'organizer' CHECK (role IN ('organizer', 'validator')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (event_id, user_id)
);

\echo '  - event_organizers ✓'
\echo ''
\echo 'Creando índices...'

-- ====================================
-- ÍNDICES
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

\echo 'Índices creados ✓'
\echo ''
\echo 'Creando triggers...'

-- ====================================
-- TRIGGERS
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

\echo 'Triggers creados ✓'
\echo ''
\echo 'Insertando datos de ejemplo...'

-- ====================================
-- DATOS DE EJEMPLO
-- ====================================
-- Usuario admin (password: Admin123!)
INSERT INTO users (id, display_name, email, password, role) VALUES 
  ('00000000-0000-0000-0000-000000000001', 'Administrador', 'admin@ticketwise.com', '$2b$10$YGQ3MDY3MTE3NTE2MzI2N.rZ5X8VKEGKEGKEGKEGKEGuXrZ5X8VKEGG', 'admin');

-- Evento de ejemplo
INSERT INTO events (id, name, description, event_date, location, status, created_by) VALUES
  ('00000000-0000-0000-0000-000000000001', 
   'Evento de Prueba', 
   'Este es un evento de ejemplo para testing', 
   NOW() + INTERVAL '30 days',
   'Auditorio Central',
   'active',
   '00000000-0000-0000-0000-000000000001');

-- Tipos de entrada
INSERT INTO ticket_types (event_id, name, price, quantity_available) VALUES
  ('00000000-0000-0000-0000-000000000001', 'General', 5000, 100),
  ('00000000-0000-0000-0000-000000000001', 'VIP', 10000, 50),
  ('00000000-0000-0000-0000-000000000001', 'Estudiante', 3000, 150);

\echo 'Datos de ejemplo insertados ✓'
\echo ''
\echo 'Creando vistas...'

-- ====================================
-- VISTAS
-- ====================================
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

\echo 'Vistas creadas ✓'
\echo ''
\echo '======================================'
\echo 'Esquema aplicado exitosamente!'
\echo '======================================'
\echo ''
\echo 'Resumen:'

SELECT 
  'users' as tabla, 
  count(*) as registros 
FROM users
UNION ALL
SELECT 'events', count(*) FROM events
UNION ALL
SELECT 'ticket_types', count(*) FROM ticket_types
UNION ALL
SELECT 'orders', count(*) FROM orders
UNION ALL
SELECT 'tickets', count(*) FROM tickets
UNION ALL
SELECT 'event_organizers', count(*) FROM event_organizers;

\echo ''
\echo 'Para probar la base de datos:'
\echo '  1. npm install'
\echo '  2. Configura .env.local con tus credenciales'
\echo '  3. npm run dev'
\echo ''
