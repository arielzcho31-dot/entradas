-- Elimina la tabla 'tickets' si ya existe para empezar de cero.
DROP TABLE IF EXISTS tickets;

-- Vuelve a crear la tabla 'tickets' con los tipos de datos correctos.
CREATE TABLE tickets (
  -- ID único para cada ticket (este sí puede ser UUID).
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- CORRECCIÓN: 'order_id' ahora es TEXT para coincidir con 'orders.id'.
  order_id TEXT REFERENCES orders(id) ON DELETE CASCADE,
  
  -- CORRECCIÓN: 'user_id' ahora es TEXT para coincidir con 'users.id'.
  user_id TEXT,
  
  -- Información denormalizada para un acceso más rápido.
  user_name TEXT,
  ticket_name TEXT,
  
  -- Estado del ticket.
  status TEXT NOT NULL DEFAULT 'verified',
  
  -- Timestamps.
  createdAt TIMESTAMPTZ NOT NULL DEFAULT now(),
  used_at TIMESTAMPTZ
);

-- Activa la seguridad a nivel de fila.
ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;

-- Política de acceso: Permite al backend (service_role) hacer todo.
CREATE POLICY "Allow full access for service_role"
ON tickets FOR ALL
USING (true);

-- Política de acceso: Permite a los usuarios leer sus propios tickets.
-- NOTA: Esta política asume que estás usando la autenticación de Supabase.
-- Si tu 'user_id' no coincide con 'auth.uid()', necesitarás ajustarla.
-- Por ahora, la dejamos así, ya que el acceso principal será desde el backend.
CREATE POLICY "Users can view their own tickets"
ON tickets FOR SELECT
USING (auth.uid()::text = user_id);
