# 🚀 Guia Completo: Sistema de Notificações WhatsApp

## 📋 O que estamos fazendo?

Quando o admin muda o status de um pedido (Ex: Recebido → Preparando → Pronto), o cliente receberá automaticamente uma mensagem no WhatsApp informando.

### Fluxo:
```
Pedido criado → Admin muda status → Banco cria notificação na fila → Worker Node.js lê fila → Envia WhatsApp → Marca como enviado
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

## 📱 PARTE 2: Configurar o Worker Node.js

### Passo 5: Preparar variáveis de ambiente

1. Crie um arquivo `.env` na raiz (se ainda não existir)
2. Configure as variáveis do worker conforme [WHATSAPP_WORKER.md](WHATSAPP_WORKER.md)

---

### Passo 6: Instalar dependências

1. Rode `npm install`

---

### Passo 7: Iniciar o worker

1. Rode `npm run whatsapp:worker`
2. ✅ O worker busca notificações pendentes e envia automaticamente

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

### Passo 17: Verificar envio no worker

1. Verifique o terminal onde o worker está rodando
2. ✅ Você deve ver logs com envio e atualização de status

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
- [ ] Worker Node.js iniciado
- [ ] Variáveis de ambiente configuradas
- [ ] Provedor WhatsApp configurado (Evolution, Z-API, etc.)
- [ ] Pedido de teste criado com telefone
- [ ] Status mudado no admin
- [ ] Notificação aparece na fila (status=pending)
- [ ] Worker processa e marca como sent
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

### Problema: worker não busca notificações
**Causa:** Variáveis do Supabase incorretas
**Solução:**
1. Verifique `SUPABASE_URL` e `SUPABASE_SERVICE_ROLE_KEY`
2. Reinicie o worker

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
- [Evolution API](https://evolution-api.com/docs)
- [Z-API](https://z-api.io/docs)
- [Meta WhatsApp Cloud API](https://developers.facebook.com/docs/whatsapp)

---

**🎉 Parabéns! Seu sistema de notificações WhatsApp está funcionando!**

Se tiver dúvidas em qualquer passo, me chame que te ajudo. 👊
