#!/bin/bash
# scripts/check-user.sh
# Verificar usuario en BD

if [ -z "$1" ]; then
  echo "Uso: bash scripts/check-user.sh email@example.com"
  exit 1
fi

EMAIL=$1

# Conectar a PostgreSQL y verificar
psql -h 127.0.0.1 -p 5432 -U postgres -d ticketwase2 << EOF
-- Verificar usuario
SELECT 
  id,
  email,
  role,
  display_name,
  password_hash,
  created_at,
  LENGTH(password_hash) as hash_length
FROM users 
WHERE LOWER(email) = LOWER('$EMAIL')
LIMIT 1;

-- Si no existe, listar todos los usuarios
SELECT 'All users:' as "---";
SELECT id, email, role, display_name, created_at FROM users LIMIT 20;
EOF
