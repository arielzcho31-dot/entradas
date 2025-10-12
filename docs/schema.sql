-- Crea la tabla para almacenar cada ticket individualmente.
CREATE TABLE tickets (
  -- ID único para cada ticket, que será el contenido del QR.
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Vincula el ticket a la orden de compra original.
  -- Si se borra la orden, se borran los tickets asociados.
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  
  -- Información denormalizada para un acceso más rápido.
  user_id UUID,
  user_name TEXT,
  ticket_name TEXT,
  
  -- Estado del ticket: 'verified' (listo para usar), 'used' (ya escaneado).
  status TEXT NOT NULL DEFAULT 'verified',
  
  -- Timestamps para auditoría.
  createdAt TIMESTAMPTZ NOT NULL DEFAULT now(),
  used_at TIMESTAMPTZ
);

-- Activa la seguridad a nivel de fila (Row Level Security).
-- Es una buena práctica de seguridad en Supabase.
ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;

-- Política de acceso: Permite a los usuarios ver solo sus propios tickets.
CREATE POLICY "Users can view their own tickets"
ON tickets FOR SELECT
USING (auth.uid() = user_id);

-- Política de acceso: Permite al backend (usando la service_role_key)
-- tener acceso completo para crear, leer, actualizar y borrar tickets.
CREATE POLICY "Allow full access for service_role"
ON tickets FOR ALL
USING (true);
