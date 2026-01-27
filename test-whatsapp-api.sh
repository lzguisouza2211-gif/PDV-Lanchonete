#!/bin/bash

# ============================================
# Script de Teste da API do WhatsApp
# Use para verificar se a API está funcionando
# ============================================

# CONFIGURAÇÃO - PREENCHA COM SEUS DADOS:
PHONE_NUMBER_ID="SEU_PHONE_NUMBER_ID"  # Pegar no Facebook Business
ACCESS_TOKEN="SEU_TOKEN_AQUI"          # Token de acesso
TO_NUMBER="5535998164190"              # Número de teste

# Fazer requisição de teste
curl -X POST \
  "https://graph.facebook.com/v18.0/${PHONE_NUMBER_ID}/messages" \
  -H "Authorization: Bearer ${ACCESS_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "messaging_product": "whatsapp",
    "to": "'"${TO_NUMBER}"'",
    "type": "text",
    "text": {
      "body": "🧪 Teste de API - Luizão Lanches"
    }
  }'

echo ""
echo "=========================================="
echo "Se deu erro, veja o código acima:"
echo "- 100 = Token inválido/expirado"
echo "- 131005 = Número não tem WhatsApp"
echo "- 131026 = Precisa usar template"
echo "=========================================="
