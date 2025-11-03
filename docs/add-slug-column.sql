-- Agregar columna slug a la tabla events
ALTER TABLE events ADD COLUMN IF NOT EXISTS slug VARCHAR(150) UNIQUE;

-- Crear índice para búsquedas rápidas por slug
CREATE INDEX IF NOT EXISTS idx_events_slug ON events(slug);

-- Generar slugs para eventos existentes (si los hay)
-- Esta función convierte el nombre a un slug válido
DO $$
DECLARE
  event_record RECORD;
  base_slug TEXT;
  final_slug TEXT;
  counter INTEGER;
BEGIN
  FOR event_record IN SELECT id, name FROM events WHERE slug IS NULL LOOP
    -- Generar slug base
    base_slug := lower(regexp_replace(
      regexp_replace(event_record.name, '[^a-zA-Z0-9\s-]', '', 'g'),
      '\s+', '-', 'g'
    ));
    
    -- Truncar a 100 caracteres
    base_slug := substring(base_slug, 1, 100);
    
    -- Asegurar que el slug sea único
    final_slug := base_slug;
    counter := 1;
    
    WHILE EXISTS (SELECT 1 FROM events WHERE slug = final_slug AND id != event_record.id) LOOP
      final_slug := base_slug || '-' || counter;
      counter := counter + 1;
    END LOOP;
    
    -- Actualizar el evento con el slug generado
    UPDATE events SET slug = final_slug WHERE id = event_record.id;
  END LOOP;
END $$;

-- Hacer que slug sea NOT NULL después de generar los slugs
-- (comentar esta línea si prefieres permitir NULL temporalmente)
-- ALTER TABLE events ALTER COLUMN slug SET NOT NULL;

COMMIT;
