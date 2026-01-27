# 🔍 Checklist - Diagnóstico de Falhas no WhatsApp

## ✅ Formato do Telefone Corrigido

### Problema Identificado
O telefone estava sendo salvo sem o código do país (55), causando falha no envio pelo WhatsApp:
- ❌ Antes: `35998164190` 
- ✅ Agora: `5535998164190`

### Migrations Aplicadas
1. **035_fix_trigger_whatsapp_columns.sql** - Corrige nomes de colunas no trigger
2. **036_fix_phone_format_whatsapp.sql** - Adiciona prefixo 55 em telefones existentes

### Código Corrigido
- **src/utils/validation.ts**: Função `limparTelefone()` agora garante código 55

---

## 📋 Checklist de Verificação no n8n

### 1. Verificar Configuração do Webhook
```
✓ Webhook está ativo?
✓ URL do webhook está correta?
✓ Método está como POST?
```

### 2. Verificar Credenciais WhatsApp
```
✓ Token de acesso está válido?
✓ Token não expirou?
✓ API do WhatsApp está ativa?
✓ Número de telefone está verificado?
```

### 3. Verificar Formato da Mensagem
No fluxo do n8n, verifique se está usando:
```javascript
// Node de envio do WhatsApp deve usar:
{
  "to": "{{ $json.telefone }}",  // Deve estar como 5535XXXXXXXXX
  "type": "text",
  "text": {
    "body": "{{ $json.mensagem }}"
  }
}
```

### 4. Verificar Business Account
- WhatsApp Business API exige conta verificada
- Número deve estar registrado no Facebook Business Manager
- Template deve estar aprovado (se usar templates)

---

## 🧪 Como Testar

### Teste 1: Verificar telefones no banco
Execute no SQL Editor do Supabase:
```sql
-- Ver telefones na fila
SELECT id, pedido_id, telefone, status, error_message
FROM whatsapp_notifications
WHERE status = 'error'
ORDER BY created_at DESC
LIMIT 10;

-- Ver telefones nos pedidos
SELECT id, cliente, telefone
FROM pedidos
ORDER BY created_at DESC
LIMIT 10;
```

### Teste 2: Reprocessar notificação manualmente
```sql
-- Resetar status de erro para pending
UPDATE whatsapp_notifications
SET status = 'pending', 
    error_message = NULL,
    processed_at = NULL
WHERE id = 97; -- ID da notificação com erro
```

### Teste 3: Fazer novo pedido
1. Limpe o cache do navegador (Ctrl+Shift+R)
2. Faça um novo pedido
3. Verifique se o telefone foi salvo corretamente:
```sql
SELECT id, cliente, telefone 
FROM pedidos 
ORDER BY id DESC 
LIMIT 1;
```

---

## 🔧 Configuração do n8n

### Fluxo Recomendado

```
1. [Webhook] - Recebe POST do Supabase
   ↓
2. [Set] - Prepara dados
   - telefone: {{ $json.telefone }}
   - mensagem: {{ $json.mensagem }}
   ↓
3. [WhatsApp Node] - Envia mensagem
   - To: {{ $json.telefone }}
   - Message: {{ $json.mensagem }}
   ↓
4. [Supabase] - Atualiza status
   - UPDATE whatsapp_notifications
   - SET status = 'sent'
   - WHERE id = {{ $json.id }}
```

### Configuração do WhatsApp Node

**Credenciais necessárias:**
- Access Token (do Facebook Business)
- Phone Number ID
- WhatsApp Business Account ID

**Endpoint da API:**
```
https://graph.facebook.com/v18.0/{phone-number-id}/messages
```

**Headers:**
```
Authorization: Bearer {access-token}
Content-Type: application/json
```

**Body (exemplo):**
```json
{
  "messaging_product": "whatsapp",
  "to": "5535998164190",
  "type": "text",
  "text": {
    "preview_url": false,
    "body": "Sua mensagem aqui"
  }
}
```

---

## 🚨 Erros Comuns e Soluções

### Erro: "send failed"
**Causas:**
1. Token expirado → Gerar novo token
2. Número inválido → Verificar formato (55XXXXXXXXXXX)
3. API rate limit → Aguardar alguns minutos
4. Conta não verificada → Verificar no Facebook Business

### Erro: "Invalid phone number"
**Solução:**
- Telefone DEVE ter formato: `5535XXXXXXXXX`
- SEM espaços, parênteses ou traços
- COM código do país (55)

### Erro: "Access token is invalid"
**Solução:**
1. Acesse Facebook Business Manager
2. Gere um novo token de acesso
3. Atualize no n8n

---

## 📞 Suporte

Se o erro persistir:
1. Verifique logs do n8n
2. Teste envio manual via Postman/Insomnia
3. Valide credenciais no Facebook Business Manager
4. Confirme que o número do restaurante (5535998943978) está verificado
