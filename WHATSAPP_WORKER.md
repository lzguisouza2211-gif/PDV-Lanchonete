# 🤖 WhatsApp Worker (Node.js)

Este worker automatiza o envio das notificações do WhatsApp a partir da tabela `whatsapp_notifications`.

## ✅ O que ele faz

- Busca linhas com `status = 'pending'`
- Envia mensagem via API do WhatsApp (Meta, Evolution, Z-API ou custom)
- Atualiza `status` para `sent` ou `error`
- Registra `processed_at` e `error_message`

## ▶️ Como rodar

1. Instale dependências:
   - `npm install`
2. Configure as variáveis de ambiente (exemplo abaixo)
3. Inicie o worker:
   - `npm run whatsapp:worker`

## 🔐 Variáveis de ambiente

Crie um `.env` na raiz do projeto com os valores abaixo:

```env
# Supabase (use service role para atualizar status)
SUPABASE_URL=https://seu-projeto.supabase.co
SUPABASE_SERVICE_ROLE_KEY=SEU_SERVICE_ROLE_KEY

# Agendamento e batch
CRON_SCHEDULE=*/30 * * * * *
BATCH_SIZE=10
REQUEST_TIMEOUT_MS=15000

# Provedor: meta | evolution | zapi | custom
WHATSAPP_PROVIDER=meta

# Meta Cloud API
WHATSAPP_PHONE_NUMBER_ID=SEU_PHONE_NUMBER_ID
WHATSAPP_API_TOKEN=SEU_ACCESS_TOKEN

# Evolution / Z-API / Custom
# WHATSAPP_API_URL=https://sua-api.com/message/sendText/sua-instancia
# WHATSAPP_API_TOKEN=SEU_TOKEN
# WHATSAPP_CLIENT_TOKEN=SEU_CLIENT_TOKEN
```

## 📌 Observações

- O worker usa os campos `phone` e `message` da tabela.
- Se existirem colunas antigas (`telefone`, `mensagem`), o worker tenta usar como fallback.
- O envio é sequencial para evitar duplicidades.
