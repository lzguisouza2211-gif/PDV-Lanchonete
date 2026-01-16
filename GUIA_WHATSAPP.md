# 🚀 Guia Completo: Sistema de Notificações WhatsApp

## 📋 O que estamos fazendo?

Quando o admin muda o status de um pedido (Ex: Recebido → Preparando → Pronto), o cliente receberá automaticamente uma mensagem no WhatsApp informando.

### Fluxo:
```
Pedido criado → Admin muda status → Banco cria notificação na fila → n8n lê fila → Envia WhatsApp → Marca como enviado
```

---

## 🗄️ PARTE 1: Configurar o Banco de Dados (Supabase)

### Passo 1: Executar Migration 020 (Adicionar coluna telefone)

1. Acesse o Supabase Dashboard: https://app.supabase.com
2. Selecione seu projeto
3. No menu lateral, clique em **SQL Editor**
4. Clique em **+ New Query**
5. Cole o conteúdo do arquivo `supabase/migration/020_telefone_e_notificacao_status.sql`
6. Clique em **Run** (ou Ctrl+Enter)
7. ✅ Deve aparecer "Success. No rows returned"

**O que isso faz:** Adiciona a coluna `telefone` na tabela `pedidos`.

---

### Passo 2: Executar Migration 021 (Criar fila de notificações)

1. No **SQL Editor**, clique em **+ New Query** novamente
2. Cole o conteúdo do arquivo `supabase/migration/021_whatsapp_queue.sql`
3. Clique em **Run**
4. ✅ Deve aparecer "Success"

**O que isso faz:** 
- Cria a tabela `whatsapp_notifications` (fila de mensagens)
- Cria um trigger que, quando o status de um pedido muda, insere automaticamente uma notificação na fila

---

### Passo 3: Executar Migration 022 (Adicionar templates)

1. No **SQL Editor**, clique em **+ New Query**
2. Cole o conteúdo do arquivo `supabase/migration/022_whatsapp_templates.sql`
3. Clique em **Run**
4. ✅ Deve aparecer "Success"

**O que isso faz:** Adiciona suporte a templates do WhatsApp (permite usar mensagens pré-aprovadas).

---

### Passo 4: Verificar se tudo foi criado

1. No menu lateral do Supabase, clique em **Table Editor**
2. Você deve ver a tabela **whatsapp_notifications** na lista
3. Clique nela e veja as colunas:
   - `id`, `pedido_id`, `cliente`, `telefone`, `status_anterior`, `status_novo`, `mensagem`, `template_id`, `template_params`, `status`, `error_message`, `created_at`, `processed_at`

✅ Se você vê essas colunas, o banco está configurado!

---

## 📱 PARTE 2: Configurar o n8n (Automação WhatsApp)

### Passo 5: Abrir o n8n

1. Acesse seu n8n: `http://localhost:5678` (ou o domínio cloud se tiver)
2. Clique em **Workflows** no menu lateral
3. Clique em **+ Add workflow** (criar novo)
4. Dê um nome: "WhatsApp - Envio de Notificações de Pedidos"

---

### Passo 6: Adicionar Trigger (Schedule)

1. Clique no **+** para adicionar o primeiro nó
2. Busque por "**Schedule Trigger**" e selecione
3. Configure:
   - **Mode:** Interval
   - **Interval:** 30 (segundos)
4. Clique em **Add & Execute node**

**O que isso faz:** Executa o workflow a cada 30 segundos para buscar notificações pendentes.

---

### Passo 7: Adicionar Supabase (Buscar notificações pendentes)

1. Clique no **+** embaixo do Schedule Trigger
2. Busque por "**Postgres**" ou "**Supabase**" e selecione
3. Configure a **Credential** (primeira vez):
   - Clique em "Create New Credential"
   - Host: pegue do Supabase (Settings → Database → Host)
   - Database: `postgres`
   - User: `postgres`
   - Password: sua senha do Supabase (Settings → Database → Database password)
   - Port: `5432`
   - SSL: `allow` ou `require`
   - Clique em **Save**
4. Configure a Query:
   - **Operation:** Execute Query
   - **Query:**
     ```sql
     SELECT * FROM whatsapp_notifications
     WHERE status = 'pending'
     ORDER BY created_at
     LIMIT 10;
     ```
5. Clique em **Execute node** para testar
6. ✅ Se não houver notificações, retorna vazio (ok!)

---

### Passo 8: Adicionar IF (Verificar se há notificações)

1. Clique no **+** embaixo do nó Postgres
2. Busque por "**IF**" e selecione
3. Configure:
   - **Conditions:**
     - **Condition:** Data Exists
   - **Mode:** Continue on true, stop on false
4. Clique em **Execute node**

**O que isso faz:** Se não houver notificações pendentes, o workflow para aqui (não envia nada).

---

### Passo 9: Adicionar Loop Over Items (Processar cada notificação)

1. Do lado "**true**" do IF, clique no **+**
2. Busque por "**Loop Over Items**" e selecione
3. Deixe as configurações padrão
4. Clique em **Execute node**

**O que isso faz:** Percorre cada notificação pendente, uma por vez.

---

### Passo 10: Adicionar HTTP Request (Enviar WhatsApp)

⚠️ **Importante:** Você precisa de um provedor de WhatsApp API. Escolha um:
- **Evolution API** (gratuito, self-hosted): https://evolution-api.com
- **Z-API** (pago): https://z-api.io
- **Twilio** (pago): https://twilio.com/whatsapp
- **Meta Cloud API** (grátis até 1000 msg/mês): https://developers.facebook.com/docs/whatsapp

Vou mostrar exemplo genérico (você adapta conforme seu provedor):

1. Do lado "**Loop Item**" do Loop Over Items, clique no **+**
2. Busque por "**HTTP Request**" e selecione
3. Configure (exemplo Evolution API):
   - **Method:** POST
   - **URL:** `https://sua-evolution-api.com/message/sendText/sua-instancia`
   - **Authentication:** Bearer Token (se necessário)
   - **Send Body:** On
   - **Body Content Type:** JSON
   - **Specify Body:** Using JSON
   - **JSON Body:**
     ```json
     {
       "number": "{{ $json.telefone }}",
       "text": "Olá {{ $json.cliente }}!\n\n{{ $json.mensagem }}\n\nPedido #{{ $json.pedido_id }}\nTotal: R$ {{ $json.payload.total }}\n\nAcompanhe seu pedido em: https://seu-site.com"
     }
     ```
4. Clique em **Execute node** (vai dar erro por enquanto, ok!)

**Adapte conforme seu provedor:**
- Evolution API: endpoint `sendText`, body `{number, text}`
- Z-API: endpoint `send-text`, body `{phone, message}`
- Twilio: endpoint e formato diferente
- Meta Cloud API: usa templates, formato mais complexo

---

### Passo 11: Adicionar Supabase (Marcar como enviado)

1. Do lado "**Output 1**" do HTTP Request, clique no **+**
2. Busque por "**Postgres**" ou "**Supabase**" e selecione
3. Use a mesma credential do Passo 7
4. Configure:
   - **Operation:** Execute Query
   - **Query:**
     ```sql
     UPDATE whatsapp_notifications
     SET status = 'sent', processed_at = NOW()
     WHERE id = {{ $json.id }};
     ```
5. Clique em **Execute node**

---

### Passo 12: Adicionar tratamento de erro

1. No nó **HTTP Request**, clique nos 3 pontinhos (...) no canto superior direito
2. Clique em "**Add Error Workflow**"
3. Adicione um nó **Postgres** conectado ao erro
4. Configure:
   - **Operation:** Execute Query
   - **Query:**
     ```sql
     UPDATE whatsapp_notifications
     SET status = 'error', 
         error_message = '{{ $json.error.message }}',
         processed_at = NOW()
     WHERE id = {{ $json.id }};
     ```

---

### Passo 13: Ativar o workflow

1. No canto superior direito, clique na chave (**Inactive**)
2. Mude para **Active**
3. ✅ O workflow agora roda automaticamente a cada 30 segundos!

---

## 🧪 PARTE 3: Testar o Sistema

### Passo 14: Criar um pedido de teste

1. Acesse seu PDV: `http://localhost:3000` (ou o domínio de produção)
2. Adicione itens ao carrinho
3. Clique em "Finalizar pedido"
4. **Importante:** Preencha:
   - Nome: "Teste WhatsApp"
   - **Telefone:** Seu número com DDD (ex: 11987654321)
   - Tipo de entrega, pagamento, etc.
5. Clique em "Finalizar pedido"
6. ✅ Pedido criado!

---

### Passo 15: Mudar status do pedido

1. Acesse o admin: `http://localhost:3000/admin` (ou seu domínio)
2. Faça login
3. Clique em "Pedidos"
4. Encontre o pedido de teste
5. Mude o status de "**Recebido**" para "**Preparando**"
6. ✅ Status atualizado!

---

### Passo 16: Verificar a fila no Supabase

1. Volte ao Supabase Dashboard
2. Clique em **Table Editor**
3. Clique em **whatsapp_notifications**
4. ✅ Você deve ver um registro:
   - `status`: `pending`
   - `cliente`: "Teste WhatsApp"
   - `telefone`: seu número
   - `status_novo`: "Preparando"
   - `mensagem`: "🔥 Seu pedido está sendo preparado com carinho!"

---

### Passo 17: Verificar envio no n8n

1. Volte ao n8n
2. Clique em **Executions** no menu lateral
3. ✅ Você deve ver execuções acontecendo a cada 30s
4. Clique na última execução
5. Verifique:
   - Schedule → ✅ verde
   - Postgres (fetch) → ✅ verde (com 1 item)
   - IF → ✅ true
   - Loop Over Items → ✅ verde
   - HTTP Request → ✅ verde (status 200)
   - Postgres (update) → ✅ verde

---

### Passo 18: Verificar se foi marcado como enviado

1. Volte ao Supabase
2. Recarregue a tabela **whatsapp_notifications** (F5)
3. ✅ O registro agora deve ter:
   - `status`: `sent`
   - `processed_at`: data/hora de agora

---

### Passo 19: Verificar WhatsApp

1. Abra o WhatsApp no celular com o número que você usou
2. ✅ Você deve ter recebido a mensagem:
   ```
   Olá Teste WhatsApp!

   🔥 Seu pedido está sendo preparado com carinho!

   Pedido #123
   Total: R$ 45.50

   Acompanhe seu pedido em: https://seu-site.com
   ```

---

## ✅ Checklist de Verificação

- [ ] Migration 020 executada (coluna telefone existe)
- [ ] Migration 021 executada (tabela whatsapp_notifications existe)
- [ ] Migration 022 executada (colunas template_id e template_params existem)
- [ ] Workflow n8n criado e ativo
- [ ] Credenciais Supabase configuradas no n8n
- [ ] Provedor WhatsApp configurado (Evolution, Z-API, etc.)
- [ ] Pedido de teste criado com telefone
- [ ] Status mudado no admin
- [ ] Notificação aparece na fila (status=pending)
- [ ] n8n processa e marca como sent
- [ ] WhatsApp recebido no celular

---

## 🔧 Troubleshooting

### Problema: Notificação não aparece na fila
**Causa:** Trigger não está funcionando
**Solução:**
1. No Supabase SQL Editor, rode:
   ```sql
   SELECT * FROM pg_trigger WHERE tgname = 'trg_enqueue_whatsapp_notification';
   ```
2. Se retornar vazio, re-execute a migration 021

### Problema: n8n não busca notificações
**Causa:** Credenciais Supabase incorretas
**Solução:**
1. No n8n, edite o nó Postgres
2. Teste a conexão clicando em "Test Connection"
3. Se falhar, verifique host, senha, port no Supabase

### Problema: HTTP Request falha
**Causa:** URL ou formato do provedor WhatsApp incorreto
**Solução:**
1. Consulte a documentação do seu provedor
2. Teste a URL manualmente com curl ou Postman
3. Ajuste o body JSON conforme a API do provedor

### Problema: WhatsApp não chega
**Causa:** Número no formato errado ou instância WhatsApp desconectada
**Solução:**
1. Verifique se o telefone está no formato correto (apenas números, com DDD)
2. Verifique se sua instância WhatsApp está conectada (QR code escaneado)
3. Teste enviar uma mensagem manual pela interface do provedor

---

## 📞 Próximos Passos

Após tudo funcionando:

1. **Ajustar templates:** Edite as mensagens no arquivo `022_whatsapp_templates.sql` e re-execute
2. **Configurar templates oficiais:** Se usar Meta Cloud API, crie templates aprovados no Business Manager
3. **Monitorar erros:** Crie um painel para ver notificações com `status='error'`
4. **Aumentar limite:** No Passo 7, aumente de 10 para 50 se tiver muito volume
5. **Adicionar retry:** Crie lógica para reenviar notificações com erro após X minutos

---

## 📚 Referências

- [Documentação Supabase](https://supabase.com/docs)
- [Documentação n8n](https://docs.n8n.io/)
- [Evolution API](https://evolution-api.com/docs)
- [Z-API](https://z-api.io/docs)
- [Meta WhatsApp Cloud API](https://developers.facebook.com/docs/whatsapp)

---

**🎉 Parabéns! Seu sistema de notificações WhatsApp está funcionando!**

Se tiver dúvidas em qualquer passo, me chame que te ajudo. 👊
