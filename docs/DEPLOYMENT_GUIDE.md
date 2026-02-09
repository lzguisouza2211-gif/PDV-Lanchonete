# Como iniciar a API do WhatsApp automaticamente no Windows

Se você está usando o Windows, o comando `pm2 startup` não funciona para inicialização automática. Siga este passo a passo para garantir que o PM2 e sua API do WhatsApp iniciem automaticamente ao ligar o notebook:

## 1. Salve o processo do PM2

No terminal, execute:
```bash
pm2 save
```

## 2. Crie um script de restauração do PM2

Crie um arquivo chamado `pm2-resurrect.bat` (por exemplo, na sua área de trabalho ou em C:\scripts) com o seguinte conteúdo:
```bat
@echo off
pm2 resurrect
```

## 3. Adicione o script à inicialização do Windows

1. Pressione `Win + R`, digite `shell:startup` e pressione Enter. Isso abrirá a pasta de inicialização do Windows.
2. Coloque um atalho para o arquivo `pm2-resurrect.bat` dentro dessa pasta.

Assim, sempre que o Windows iniciar, o PM2 irá restaurar e iniciar automaticamente todos os processos salvos, incluindo sua API do WhatsApp.

---
**Observação:**
- Certifique-se de que o Node.js e o PM2 estejam no PATH do sistema.
- Sempre que adicionar ou remover processos do PM2, execute novamente `pm2 save` para atualizar o snapshot.
# Guia de Deploy - WhatsApp Worker e Sistema de Impressão

Este guia explica como configurar e executar os sistemas de **notificação WhatsApp** e **impressão** tanto no seu ambiente de desenvolvimento (Linux) quanto na máquina do cliente (Windows).

---

## 📋 Índice

1. [Visão Geral](#visão-geral)
2. [Configuração Inicial](#configuração-inicial)
3. [Worker de Notificação WhatsApp](#worker-de-notificação-whatsapp)
4. [Sistema de Impressão](#sistema-de-impressão)
5. [Deploy Windows (Cliente)](#deploy-windows-cliente)
6. [Deploy Linux (Desenvolvimento)](#deploy-linux-desenvolvimento)
7. [Troubleshooting](#troubleshooting)

---

## 🎯 Visão Geral

O sistema possui dois serviços que rodam em **background** (processos persistentes):

### 1. **WhatsApp Worker** (`scripts/whatsapp-worker.js`)
- **Função**: Envia notificações automáticas via WhatsApp quando há pedidos
- **Como funciona**: A cada 30 segundos, busca registros pendentes na tabela `whatsapp_notifications` e envia via Z-API
- **Onde roda**: Pode rodar no Windows do cliente OU em servidor (não roda no Vercel)

### 2. **Sistema de Impressão** (`printer-backend.js`)
- **Função**: Recebe comandos de impressão via API HTTP e imprime na impressora térmica
- **Como funciona**: API REST que escuta na porta 3001 e envia comandos ESC/POS para a impressora
- **Onde roda**: **SOMENTE** no Windows do cliente (onde a impressora está conectada)

---

## ⚙️ Configuração Inicial

### 1. Instalar Dependências

Certifique-se de ter instalado:

```bash
# Node.js (versão 18 ou superior)
node --version  # Deve ser >= v18.0.0

# NPM
npm --version

# Instalar dependências do projeto
npm install
```

### 2. Criar Arquivos .env

Você precisa criar 3 arquivos de ambiente:

#### `.env.dev` (Desenvolvimento)
```env
VITE_SUPABASE_URL=https://seu-projeto-dev.supabase.co
VITE_SUPABASE_ANON_KEY=sua-anon-key-dev

SUPABASE_URL=https://seu-projeto-dev.supabase.co
SUPABASE_SERVICE_ROLE_KEY=sua-service-role-key-dev
WHATSAPP_PROVIDER=zapi
WHATSAPP_API_URL=https://api.z-api.io/instances/SUA_INSTANCIA/token/SEU_TOKEN/send-text
WHATSAPP_CLIENT_TOKEN=seu-client-token
```

#### `.env.hml` (Homologação)
```env
VITE_SUPABASE_URL=https://wvtvplqrsenvkkfvonup.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_DL0NESSM7llmWcUVdX2Ikg_HT_6tPHJ

SUPABASE_URL=https://wvtvplqrsenvkkfvonup.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
WHATSAPP_PROVIDER=zapi
WHATSAPP_API_URL=https://api.z-api.io/instances/3ED9E75292B602C4E9141AA3C48FFF2B/token/0AF0C8921508022F97867F24/send-text
WHATSAPP_CLIENT_TOKEN=F6bb211668e964ad4ad63a73fdd512bebS
```

#### `.env.prod` (Produção - Cliente)
```env
VITE_SUPABASE_URL=https://seu-projeto-prod.supabase.co
VITE_SUPABASE_ANON_KEY=sua-anon-key-prod

SUPABASE_URL=https://seu-projeto-prod.supabase.co
SUPABASE_SERVICE_ROLE_KEY=sua-service-role-key-prod
WHATSAPP_PROVIDER=zapi
WHATSAPP_API_URL=https://api.z-api.io/instances/INSTANCIA_PROD/token/TOKEN_PROD/send-text
WHATSAPP_CLIENT_TOKEN=client-token-prod
```

---

## 📱 Worker de Notificação WhatsApp

### Testando Localmente

```bash
# Testar com ambiente DEV
npm run whatsapp:worker:dev

# Testar com ambiente HML
npm run whatsapp:worker:hml

# Testar com ambiente PROD
npm run whatsapp:worker:prod
```

### Verificando se está Funcionando

Você verá logs assim:

```
✅ WhatsApp worker started
📋 Cron schedule: */30 * * * * * (every 30 seconds)
🔄 Checking for pending notifications...
📦 Found 3 pending notifications
✅ [ID 1] Notification sent successfully
✅ [ID 2] Notification sent successfully
✅ [ID 3] Notification sent successfully
```

---

## 🖨️ Sistema de Impressão

### Testando Localmente

```bash
# Iniciar servidor de impressão
npm run printer:server

# Ou, se estiver usando CUPS (Linux)
npm run printer:cups
```

O servidor ficará escutando em `http://localhost:3001`

### Testar Impressão

```bash
curl -X POST http://localhost:3001/print \
  -H "Content-Type: application/json" \
  -d '{
    "pedidoId": 123,
    "cliente": "João Silva",
    "items": [{"nome": "X-Bacon", "quantidade": 2, "preco": 15.00}],
    "total": 30.00,
    "pagamento": "dinheiro"
  }'
```

---

## 🪟 Deploy Windows (Cliente)

O cliente precisa rodar **ambos** os serviços: WhatsApp Worker + Sistema de Impressão

### Passo 1: Instalar Node.js

1. Baixe e instale: https://nodejs.org (versão LTS)
2. Verifique: `node --version` no Prompt de Comando

### Passo 2: Instalar PM2 Globalmente

PM2 mantém os processos rodando mesmo após reiniciar o computador.

```cmd
npm install -g pm2
npm install -g pm2-windows-startup

# Configurar para iniciar com Windows
pm2-startup install
```

### Passo 3: Clonar o Projeto

```cmd
cd C:\Users\Cliente\Desktop
git clone https://github.com/seu-usuario/cardapio-digital-vite.git
cd cardapio-digital-vite
npm install
```

### Passo 4: Configurar .env.prod

Crie o arquivo `.env.prod` com as credenciais de **produção** (veja exemplo acima)

### Passo 5: Iniciar Serviços com PM2

```cmd
# Iniciar WhatsApp Worker (produção)
pm2 start npm --name "whatsapp-worker" -- run whatsapp:worker:prod

# Iniciar Sistema de Impressão
pm2 start npm --name "printer-backend" -- run printer:server

# Salvar configuração
pm2 save

# Verificar status
pm2 status
```

### Passo 6: Configurar Startup Automático

```cmd
# Gerar script de inicialização
pm2 startup

# Executar o comando que o PM2 mostrar (será algo como)
# pm2 startup windows
```

Agora os serviços iniciarão automaticamente quando o Windows ligar!

### Gerenciar Processos

```cmd
# Ver logs em tempo real
pm2 logs whatsapp-worker
pm2 logs printer-backend

# Parar serviço
pm2 stop whatsapp-worker

# Reiniciar serviço
pm2 restart whatsapp-worker

# Remover serviço
pm2 delete whatsapp-worker

# Ver status de todos
pm2 status
```

---

## 🐧 Deploy Linux (Desenvolvimento)

### Usando PM2 (Recomendado)

```bash
# Instalar PM2
npm install -g pm2

# Iniciar worker HML
pm2 start npm --name "whatsapp-worker-hml" -- run whatsapp:worker:hml

# Iniciar printer (se necessário no Linux)
pm2 start npm --name "printer-backend" -- run printer:cups

# Salvar e configurar startup
pm2 save
pm2 startup
```

### Usando systemd (Alternativa)

Crie `/etc/systemd/system/whatsapp-worker.service`:

```ini
[Unit]
Description=WhatsApp Worker HML
After=network.target

[Service]
Type=simple
User=seu-usuario
WorkingDirectory=/caminho/para/cardapio-digital-vite
Environment="NODE_ENV=hml"
ExecStart=/usr/bin/node scripts/whatsapp-worker.js
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

Depois:

```bash
sudo systemctl daemon-reload
sudo systemctl enable whatsapp-worker
sudo systemctl start whatsapp-worker
sudo systemctl status whatsapp-worker
```

---

## 🔧 Troubleshooting

### Worker não encontra notificações pendentes

**Problema**: Logs mostram "No pending notifications" mas existem registros no banco

**Soluções**:
1. Verifique se está usando o `.env` correto:
   ```bash
   # No Linux/Mac
   NODE_ENV=hml npm run whatsapp:worker:hml
   
   # No Windows
   set NODE_ENV=hml && npm run whatsapp:worker:hml
   ```

2. Confirme que o `SUPABASE_SERVICE_ROLE_KEY` está correto:
   - Vá em Supabase → Settings → API
   - Copie a chave "service_role secret"
   - Verifique se o projeto (`ref`) no token corresponde ao projeto correto

3. Verifique as políticas RLS no Supabase:
   ```sql
   -- No SQL Editor do Supabase, execute:
   SELECT * FROM whatsapp_notifications WHERE status = 'pending';
   ```

### Erro de conexão com WhatsApp API

**Problema**: `Error sending notification: Network Error`

**Soluções**:
1. Verifique se a instância Z-API está ativa
2. Teste a URL manualmente:
   ```bash
   curl -X POST "https://api.z-api.io/instances/SUA_INSTANCIA/token/SEU_TOKEN/send-text" \
     -H "Client-Token: SEU_CLIENT_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"phone": "5535999999999", "message": "Teste"}'
   ```
3. Verifique firewall/antivírus bloqueando conexões

### Impressora não responde

**Problema**: API retorna sucesso mas não imprime

**Soluções**:
1. Verifique se a impressora está ligada e conectada via USB
2. Confirme a porta serial no código:
   ```javascript
   // No printer-backend.js, linha ~20
   const PRINTER_PORT = 'COM3'; // Windows
   // ou
   const PRINTER_PORT = '/dev/usb/lp0'; // Linux
   ```
3. Teste se a porta está disponível:
   ```cmd
   # Windows
   mode COM3
   
   # Linux
   ls -l /dev/usb/lp0
   ```

### PM2 não inicia com Windows

**Problema**: Serviços não iniciam após reiniciar

**Soluções**:
1. Reinstale o pm2-windows-startup:
   ```cmd
   npm install -g pm2-windows-startup
   pm2-startup install
   pm2 save --force
   ```
2. Verifique se está rodando como Administrador
3. Verifique no Agendador de Tarefas do Windows se a tarefa PM2 existe

### Erro "MODULE_NOT_FOUND"

**Problema**: `Error: Cannot find module 'axios'`

**Solução**:
```bash
# Reinstalar dependências
npm install

# Se persistir, limpar cache
rm -rf node_modules package-lock.json
npm install
```

---

## 📊 Monitoramento

### Logs do Worker

```bash
# Ver últimas 50 linhas
pm2 logs whatsapp-worker --lines 50

# Seguir logs em tempo real
pm2 logs whatsapp-worker --raw

# Salvar logs em arquivo
pm2 logs whatsapp-worker > logs-whatsapp.txt
```

### Logs do Sistema de Impressão

```bash
pm2 logs printer-backend --lines 50
```

### Verificar no Supabase

Execute no SQL Editor:

```sql
-- Ver notificações pendentes
SELECT * FROM whatsapp_notifications 
WHERE status = 'pending' 
ORDER BY created_at DESC 
LIMIT 10;

-- Ver notificações enviadas nas últimas 24h
SELECT * FROM whatsapp_notifications 
WHERE status = 'sent' 
  AND processed_at > NOW() - INTERVAL '24 hours'
ORDER BY processed_at DESC;

-- Ver erros
SELECT * FROM whatsapp_notifications 
WHERE status = 'error' 
ORDER BY processed_at DESC 
LIMIT 10;
```

---

## 🚀 Resumo Rápido

### No Windows do Cliente (Produção)

```cmd
# Instalar dependências
npm install -g pm2 pm2-windows-startup
cd C:\caminho\do\projeto
npm install

# Criar .env.prod com credenciais
notepad .env.prod

# Iniciar serviços
pm2 start npm --name "whatsapp-worker" -- run whatsapp:worker:prod
pm2 start npm --name "printer-backend" -- run printer:server
pm2 save
pm2-startup install

# Pronto! Verificar status:
pm2 status
pm2 logs
```

### No Linux (Desenvolvimento/HML)

```bash
# Instalar PM2
npm install -g pm2

# Iniciar worker HML
pm2 start npm --name "whatsapp-worker-hml" -- run whatsapp:worker:hml
pm2 save
pm2 startup

# Verificar
pm2 status
pm2 logs whatsapp-worker-hml
```

---

## 📞 Suporte

Se encontrar problemas:

1. Verifique os logs: `pm2 logs`
2. Confira o ambiente correto: `.env.dev`, `.env.hml`, `.env.prod`
3. Teste conexões: Supabase, Z-API, impressora
4. Consulte a seção [Troubleshooting](#troubleshooting)

---

**Última atualização**: 5 de fevereiro de 2026
