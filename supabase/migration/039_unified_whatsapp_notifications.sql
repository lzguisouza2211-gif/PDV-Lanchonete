-- ============================================
-- Migration 039: Unificação completa do sistema WhatsApp
-- 
-- Esta migration consolida as mudanças das migrations 033-038:
-- - 033: Restauração da fila de notificações
-- - 034: Trigger inicial para novo pedido
-- - 035: Correção de nomes de colunas
-- - 036: Formatação de telefones com código Brasil (55)
-- - 037-038: Remoção de notificações do restaurante (apenas cliente)
--
-- Objetivo final: Sistema de notificação por WhatsApp apenas para CLIENTES
-- ============================================

-- ============================================
-- PARTE 1: Criar/garantir tabela de fila de notificações
-- ============================================
-- Cria a tabela que armazena todas as notificações a enviar
CREATE TABLE IF NOT EXISTS whatsapp_notifications (
  id               BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  pedido_id        BIGINT NOT NULL,
  cliente          TEXT,                          -- Nome do cliente que recebe a notificação
  phone            TEXT,                          -- Telefone em formato internacional (5535XXXXXXXXX)
  status_anterior  TEXT,                          -- Status anterior do pedido (para auditoria)
  status_novo      TEXT,                          -- Novo status do pedido (para auditoria)
  message          TEXT,                          -- Mensagem de texto a enviar
  payload          JSONB,                         -- Dados completos do pedido
  status           TEXT NOT NULL DEFAULT 'pending', -- Fluxo: pending → sent ou error
  error_message    TEXT,                          -- Descrição do erro se houver
  template_id      TEXT,                          -- ID do template (futuro)
  template_params  JSONB DEFAULT '{}'::jsonb,    -- Parâmetros do template (futuro)
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  processed_at     TIMESTAMPTZ                    -- Timestamp quando foi processado
);

-- Índices para otimizar buscas frequentes do n8n
CREATE INDEX IF NOT EXISTS whatsapp_notifications_status_idx 
  ON whatsapp_notifications(status);
CREATE INDEX IF NOT EXISTS whatsapp_notifications_pedido_idx 
  ON whatsapp_notifications(pedido_id);

-- ============================================
-- PARTE 2: Função que enfileira notificação para mudanças de status
-- ============================================
-- Nota: Esta função NÃO é usada atualmente, pois o n8n gerencia o fluxo
-- Mantida para compatibilidade futura
CREATE OR REPLACE FUNCTION public.enqueue_whatsapp_notification()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  status_msg TEXT;
  tpl_id TEXT;
  tpl_params JSONB := '{}'::jsonb;
  telefone_limpado TEXT;
BEGIN
  telefone_limpado := NULLIF(TRIM(new.telefone), '');

  -- Se o status mudou e temos telefone válido
  IF old.status IS DISTINCT FROM new.status AND telefone_limpado IS NOT NULL THEN
    CASE new.status
      WHEN 'Recebido' THEN
        status_msg := 'Pedido recebido! Estamos preparando seu pedido.';
        tpl_id := 'pedido_recebido';
      WHEN 'Em preparo' THEN
        status_msg := 'Seu pedido está em preparo. Avisaremos quando finalizar.';
        tpl_id := 'pedido_em_preparo';
      WHEN 'Finalizado' THEN
        status_msg := 'Pedido finalizado! Obrigado pela preferência.';
        tpl_id := 'pedido_finalizado';
      ELSE
        status_msg := 'Status do pedido atualizado: ' || new.status;
        tpl_id := 'pedido_status_atualizado';
    END CASE;

    tpl_params := jsonb_build_object(
      'cliente', new.cliente,
      'pedido_id', new.id,
      'status_novo', new.status,
      'total', new.total,
      'tipoentrega', new.tipoentrega,
      'endereco', new.endereco,
      'formapagamento', new.formapagamento
    );

    -- Insere na fila para ser processada
    INSERT INTO whatsapp_notifications (
      pedido_id, cliente, phone, status_anterior, status_novo, message, payload, status, template_id, template_params
    ) VALUES (
      new.id,
      new.cliente,
      telefone_limpado,
      old.status,
      new.status,
      status_msg,
      jsonb_build_object(
        'pedido_id', new.id,
        'cliente', new.cliente,
        'phone', telefone_limpado,
        'total', new.total,
        'status_anterior', old.status,
        'status_novo', new.status,
        'message', status_msg,
        'tipoentrega', new.tipoentrega,
        'endereco', new.endereco,
        'formapagamento', new.formapagamento,
        'created_at', new.created_at,
        'template_id', tpl_id,
        'template_params', tpl_params
      ),
      'pending',
      tpl_id,
      tpl_params
    );
  END IF;

  RETURN new;
END;
$$;

-- ============================================
-- PARTE 3: Trigger para NOVO PEDIDO (enfileira mensagem de confirmação)
-- ============================================
-- Quando um novo pedido é criado, automaticamente enfileira a confirmação WhatsApp
-- IMPORTANTE: Apenas o CLIENTE recebe mensagem, NÃO o restaurante
CREATE OR REPLACE FUNCTION public.enqueue_new_order_notification()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  mensagem_cliente TEXT;
BEGIN
  -- Validação: Se telefone está vazio, não enfileira
  -- Isto evita erros ao processar no n8n
  IF NEW.telefone IS NULL OR TRIM(NEW.telefone) = '' THEN
    RETURN NEW;
  END IF;

  -- Monta mensagem de confirmação para o cliente
  -- Esta é a mensagem que o cliente recebe ao criar o pedido
  mensagem_cliente :=
    '✅ *Pedido Recebido!*' || E'\n\n' ||
    'Olá *' || NEW.cliente || '*,' || E'\n\n' ||
    'Seu pedido foi confirmado!' || E'\n' ||
    '💰 Total: R$ ' || NEW.total || E'\n\n' ||
    'Em breve entraremos em contato.' || E'\n\n' ||
    '🍔 Luizão Lanches';

  -- Insere na fila (status='pending')
  -- O n8n busca registros com status='pending' e os processa
  -- Após envio, n8n atualiza para status='sent'
  INSERT INTO whatsapp_notifications
    (pedido_id, cliente, phone, message, status, created_at)
  VALUES
    (NEW.id, NEW.cliente, NEW.telefone, mensagem_cliente, 'pending', NOW());

  RETURN NEW;
END;
$$;

-- Cria trigger que executa após INSERT de novo pedido
DROP TRIGGER IF EXISTS trg_enqueue_new_order ON public.pedidos;
CREATE TRIGGER trg_enqueue_new_order
AFTER INSERT ON public.pedidos
FOR EACH ROW
EXECUTE FUNCTION public.enqueue_new_order_notification();

COMMENT ON FUNCTION public.enqueue_new_order_notification() IS 
  'Enfileira notificação WhatsApp apenas para o CLIENTE quando novo pedido é criado';

-- ============================================
-- PARTE 4: Limpeza e formatação de telefones existentes
-- ============================================
-- Corrige telefones antigos que não têm código do país (55)
-- Isso garante compatibilidade com a API Z-API do WhatsApp
UPDATE whatsapp_notifications
SET phone = '55' || phone
WHERE 
  phone IS NOT NULL 
  AND phone !~ '^55'              -- Não começa com 55
  AND LENGTH(phone) IN (10, 11)   -- 10 ou 11 dígitos (formato Brasil)
  AND phone ~ '^[0-9]+$';         -- Contém apenas números

-- Mesma operação para a tabela pedidos
UPDATE pedidos
SET telefone = '55' || telefone
WHERE 
  telefone IS NOT NULL 
  AND telefone !~ '^55' 
  AND LENGTH(telefone) IN (10, 11)
  AND telefone ~ '^[0-9]+$';

-- Remove notificações antigas do restaurante (se existirem)
DELETE FROM whatsapp_notifications
WHERE cliente = 'Restaurante';

-- ============================================
-- PARTE 5: Documentação e comentários de índices
-- ============================================
COMMENT ON TABLE whatsapp_notifications IS 
  'Fila de notificações WhatsApp. O n8n processa linhas com status=pending, envia via Z-API e atualiza para status=sent';

COMMENT ON COLUMN whatsapp_notifications.phone IS 
  'Telefone no formato internacional (5535XXXXXXXXX). Obrigatório para envio via Z-API/WhatsApp';

COMMENT ON COLUMN whatsapp_notifications.message IS 
  'Texto da mensagem WhatsApp a enviar. Suporta formatação Markdown: *negrito*, _itálico_, ~riscado~';

COMMENT ON COLUMN whatsapp_notifications.status IS 
  'Estados possíveis: pending (aguardando envio) → sent (enviado com sucesso) ou error (falha no envio)';

COMMENT ON COLUMN whatsapp_notifications.cliente IS 
  'Nome do destinatário da mensagem. Deve ser "cliente" (nunca "Restaurante")';

COMMENT ON COLUMN pedidos.telefone IS 
  'Telefone do cliente no formato internacional (5535XXXXXXXXX)';

-- ============================================
-- FIM DA MIGRATION 039
-- ============================================
-- Resumo do que foi feito:
-- 1. Tabela whatsapp_notifications com todas as colunas corretas
-- 2. Índices para performance (status e pedido_id)
-- 3. Funções para enfileirar (mudança de status e novo pedido)
-- 4. Trigger ativo para novos pedidos
-- 5. Formatação de todos os telefones com código 55
-- 6. Limpeza de notificações do restaurante
-- 7. Documentação completa de colunas
--
-- O fluxo atual é:
-- Cliente cria pedido → Trigger enfileira notificação (status=pending)
-- → n8n lê linhas com status=pending a cada minuto
-- → n8n envia via Z-API/WhatsApp
-- → n8n atualiza status para 'sent' ou 'error'
-- ============================================
