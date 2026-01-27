# 🔍 Debug: Erro "send failed" no n8n

## ✅ Telefone Está Correto
```
5535998164190 ✓ (formato correto com código 55)
```

## 🔴 Causas Possíveis do "send failed"

### 1. **Token de Acesso Expirado** (mais comum)
**Como verificar:**
- Acesse Facebook Business Manager
- Verifique se o token ainda está ativo
- Tokens temporários expiram em 24h-60 dias

**Como corrigir:**
1. Gere um novo token permanente
2. Atualize no n8n nas credenciais do WhatsApp
3. Reprocesse a notificação

### 2. **Número do WhatsApp não Verificado**
**Verificar:**
- O número `5535998943978` está verificado no Facebook Business?
- O número `5535998164190` (cliente) está no WhatsApp?

### 3. **Rate Limit da API WhatsApp**
**Sintoma:** Muitas mensagens em pouco tempo
**Solução:** Aguardar alguns minutos e reprocessar

### 4. **Formato da Requisição no n8n**
Verifique se o node do WhatsApp está configurado assim:

```json
{
  "messaging_product": "whatsapp",
  "recipient_type": "individual",
  "to": "{{ $json.telefone }}",
  "type": "text",
  "text": {
    "preview_url": false,
    "body": "{{ $json.mensagem }}"
  }
}
```

### 5. **Headers da Requisição**
```
Content-Type: application/json
Authorization: Bearer {SEU_TOKEN_AQUI}
```

---

## 🧪 Como Testar

### Teste 1: Verificar se a API está respondendo
No terminal ou Postman, execute:

```bash
curl -X POST \
  'https://graph.facebook.com/v18.0/YOUR_PHONE_ID/messages' \
  -H 'Authorization: Bearer YOUR_TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
    "messaging_product": "whatsapp",
    "to": "5535998164190",
    "type": "text",
    "text": {
      "body": "Teste de mensagem"
    }
  }'
```

**Resposta esperada de sucesso:**
```json
{
  "messaging_product": "whatsapp",
  "contacts": [{
    "input": "5535998164190",
    "wa_id": "5535998164190"
  }],
  "messages": [{
    "id": "wamid.xxx..."
  }]
}
```

**Resposta de erro comum:**
```json
{
  "error": {
    "message": "(#100) Invalid OAuth 2.0 Access Token",
    "type": "OAuthException",
    "code": 100
  }
}
```

### Teste 2: Verificar logs do n8n
1. No n8n, abra o workflow
2. Execute manualmente
3. Clique no node do WhatsApp
4. Veja o OUTPUT e ERROR

---

## 🛠️ Soluções Rápidas

### Solução 1: Reprocessar com Logs
```sql
-- Ver detalhes da notificação com erro
SELECT id, pedido_id, telefone, mensagem, error_message, created_at
FROM whatsapp_notifications
WHERE id = 97;

-- Resetar para reprocessar
UPDATE whatsapp_notifications
SET status = 'pending',
    error_message = NULL,
    processed_at = NULL
WHERE id = 97;
```

### Solução 2: Testar com Número Diferente
```sql
-- Criar notificação de teste com seu número
INSERT INTO whatsapp_notifications (
  pedido_id, cliente, telefone, mensagem, status, created_at
) VALUES (
  256, 
  'Teste', 
  '5535SEUNUMERO', -- SEU NÚMERO AQUI
  '🧪 Teste de envio pelo n8n',
  'pending',
  NOW()
);
```

### Solução 3: Verificar WhatsApp Business API
Acesse: https://business.facebook.com/wa/manage/phone-numbers/

**Checklist:**
- [ ] Número está conectado?
- [ ] Número está verificado?
- [ ] Qualidade do número está boa (não bloqueado)?
- [ ] Limite de mensagens não foi atingido?

---

## 📋 Configuração Completa do n8n

### Node 1: Webhook
```
URL: https://seu-n8n.com/webhook/whatsapp
Method: POST
```

### Node 2: Set (Preparar Dados)
```javascript
return {
  pedido_id: $json.pedido_id,
  cliente: $json.cliente,
  telefone: $json.telefone,
  mensagem: $json.mensagem,
  notification_id: $json.id
};
```

### Node 3: HTTP Request (WhatsApp API)
```
Method: POST
URL: https://graph.facebook.com/v18.0/YOUR_PHONE_ID/messages

Authentication: Generic Credential Type
  - Header Auth
  - Name: Authorization
  - Value: Bearer YOUR_TOKEN

Body:
{
  "messaging_product": "whatsapp",
  "to": "{{ $json.telefone }}",
  "type": "text",
  "text": {
    "body": "{{ $json.mensagem }}"
  }
}
```

### Node 4: IF (Verificar Sucesso)
```
Condition: {{ $json.messages }} exists
```

### Node 5A: Supabase (Sucesso)
```sql
UPDATE whatsapp_notifications
SET status = 'sent',
    processed_at = NOW(),
    error_message = NULL
WHERE id = {{ $('Set').item.json.notification_id }}
```

### Node 5B: Supabase (Erro)
```sql
UPDATE whatsapp_notifications
SET status = 'error',
    processed_at = NOW(),
    error_message = '{{ $json.error.message }}'
WHERE id = {{ $('Set').item.json.notification_id }}
```

---

## 🚨 Erros Comuns e Códigos

| Código | Erro | Solução |
|--------|------|---------|
| 100 | Invalid OAuth token | Gerar novo token |
| 131000 | Rate limit | Aguardar e reenviar |
| 131005 | Phone not on WhatsApp | Verificar número |
| 131008 | Message undeliverable | Número bloqueado/inválido |
| 131026 | Message out of window | Usar template aprovado |
| 131047 | Re-engagement required | Cliente precisa iniciar conversa |

---

## 📞 Próximos Passos

1. **Execute a migration 037** (escolha A ou B)
2. **Teste o envio manual** via Postman/cURL
3. **Verifique os logs do n8n** para erro específico
4. **Atualize o token** se necessário
5. **Reprocesse as notificações** pendentes

Se o erro persistir, compartilhe:
- Log completo do n8n
- Response da API do WhatsApp
- Status do número no Facebook Business
