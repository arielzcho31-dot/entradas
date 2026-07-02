#!/bin/bash
# scripts/generate-secrets.sh
# Generar secretos seguros para .env.local

echo "🔐 Generador de Secretos - TicketWise"
echo "======================================"
echo ""

echo "1️⃣  JWT_SECRET (32 bytes aleatorios):"
JWT_SECRET=$(openssl rand -base64 32)
echo "JWT_SECRET=$JWT_SECRET"
echo ""

echo "2️⃣  REFRESH_TOKEN_SECRET (32 bytes aleatorios):"
REFRESH_SECRET=$(openssl rand -base64 32)
echo "REFRESH_TOKEN_SECRET=$REFRESH_SECRET"
echo ""

echo "======================================"
echo "✅ Copia estos valores a tu .env.local"
echo ""
echo "Importante:"
echo "- No compartir estos secretos"
echo "- Cambiarlos si están comprometidos"
echo "- En producción, usar Key Management Service (AWS KMS, etc)"
echo "======================================"
