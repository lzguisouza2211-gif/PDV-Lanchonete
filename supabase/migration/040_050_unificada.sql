-- ============================================
-- Migration Unificada: 040-050
-- Inclui todas as alterações das migrations 040 a 050
-- ============================================

-- 040: Notificações WhatsApp para mudanças de STATUS
-- (Conteúdo da 040)
-- ============================================
-- Migration 040: Notificações WhatsApp para mudanças de STATUS
-- ...
-- (Conteúdo já incluído em migrations posteriores, consolidar na função final)

-- 041: Corrigir duplicação de notificações WhatsApp
-- ============================================
DROP TRIGGER IF EXISTS trg_enqueue_new_order ON public.pedidos;
DROP TRIGGER IF EXISTS trg_whatsapp_on_status_change ON public.pedidos;

-- 042: Adicionar campo tempo_preparo na tabela pedidos
-- ============================================
ALTER TABLE public.pedidos
ADD COLUMN IF NOT EXISTS tempo_preparo INTEGER DEFAULT 40;

COMMENT ON COLUMN public.pedidos.tempo_preparo IS 
  'Tempo estimado de preparo em minutos. Padrão: 40 min. Editável pelo admin.';

UPDATE public.pedidos
SET tempo_preparo = 40
WHERE tempo_preparo IS NULL;

ALTER TABLE public.pedidos
DROP CONSTRAINT IF EXISTS chk_tempo_preparo_positivo;
ALTER TABLE public.pedidos
ADD CONSTRAINT chk_tempo_preparo_positivo
CHECK (tempo_preparo IS NULL OR tempo_preparo > 0);

CREATE INDEX IF NOT EXISTS idx_pedidos_status_tempo
ON public.pedidos(status, tempo_preparo);

-- 043/048: Função format_pedido_itens (com extras e observações)
-- ============================================
CREATE OR REPLACE FUNCTION public.format_pedido_itens(itens JSONB)
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  resultado TEXT := '';
  item RECORD;
  extra RECORD;
  tem_extras BOOLEAN;
  observacoes_texto TEXT;
BEGIN
  FOR item IN 
    SELECT 
      (value->>'quantidade')::INTEGER as quantidade,
      value->>'nome' as nome,
      value->'extras' as extras,
      value->>'observacoes' as observacoes
    FROM jsonb_array_elements(itens)
  LOOP
    resultado := resultado || '🍔 ' || item.quantidade || 'x ' || item.nome || E'\n';
    tem_extras := FALSE;
    IF item.extras IS NOT NULL AND jsonb_array_length(item.extras) > 0 THEN
      tem_extras := TRUE;
      FOR extra IN 
        SELECT 
          value->>'nome' as nome,
          value->>'tipo' as tipo
        FROM jsonb_array_elements(item.extras)
      LOOP
        IF extra.tipo = 'add' THEN
          resultado := resultado || '   + ' || extra.nome || E'\n';
        ELSIF extra.tipo = 'remove' THEN
          resultado := resultado || '   - Sem ' || extra.nome || E'\n';
        END IF;
      END LOOP;
    END IF;
    observacoes_texto := TRIM(item.observacoes);
    IF observacoes_texto IS NOT NULL AND observacoes_texto != '' THEN
      resultado := resultado || '   📝 ' || observacoes_texto || E'\n';
    END IF;
    resultado := resultado || E'\n';
  END LOOP;
  RETURN resultado;
END;
$$;

COMMENT ON FUNCTION public.format_pedido_itens(JSONB) IS 
  'Formata itens do pedido incluindo adicionais, remoções e observações para mensagem WhatsApp.';

-- 045/046: Padronizar coluna phone/telefone (usar phone)
-- ============================================
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'pedidos' AND column_name = 'telefone'
  ) THEN
    EXECUTE 'ALTER TABLE public.pedidos RENAME COLUMN telefone TO phone';
  END IF;
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'whatsapp_notifications' AND column_name = 'telefone'
  ) THEN
    EXECUTE 'ALTER TABLE public.whatsapp_notifications RENAME COLUMN telefone TO phone';
  END IF;
END
$$;

-- 047: Consolidar triggers WhatsApp
-- ============================================
DROP TRIGGER IF EXISTS trg_whatsapp_on_status_change ON public.pedidos CASCADE;
DROP TRIGGER IF EXISTS trg_whatsapp_notification ON public.pedidos CASCADE;
DROP TRIGGER IF EXISTS trg_enqueue_whatsapp_notification ON public.pedidos CASCADE;
DROP FUNCTION IF EXISTS public.enqueue_whatsapp_on_status_change() CASCADE;

CREATE OR REPLACE FUNCTION public.enqueue_whatsapp_notification()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  mensagem_cliente TEXT;
  é_novo_pedido BOOLEAN;
  itens_formatado TEXT;
BEGIN
  IF NEW.phone IS NULL OR TRIM(NEW.phone) = '' THEN
    RETURN NEW;
  END IF;
  é_novo_pedido := (TG_OP = 'INSERT');
  IF é_novo_pedido THEN
    itens_formatado := public.format_pedido_itens(NEW.itens);
    mensagem_cliente :=
      '✅ *Pedido Recebido (#' || NEW.id || ')*' || E'\n\n' ||
      'Olá, *' || NEW.cliente || '*' || E'\n\n' ||
      'Seu pedido:' || E'\n' ||
      itens_formatado || E'\n' ||
      'foi confirmado!!' || E'\n\n' ||
      '💰 Total: R$ ' || COALESCE(NEW.total, '0.00');
    INSERT INTO whatsapp_notifications
      (pedido_id, cliente, phone, message, status_anterior, status_novo, created_at)
    VALUES
      (NEW.id, NEW.cliente, NEW.phone, mensagem_cliente, NULL, NEW.status, NOW());
  ELSIF OLD.status IS DISTINCT FROM NEW.status THEN
    CASE NEW.status
      WHEN 'Em preparo' THEN
        mensagem_cliente :=
          '*' || NEW.cliente || '!!!*' || E'\n\n' ||
          '👨‍🍳 Seu pedido está sendo preparado!!';
      WHEN 'Finalizado' THEN
        IF NEW.tipoentrega = 'entrega' THEN
          mensagem_cliente :=
            '🚗 *Seu pedido saiu para entrega!!*' || E'\n\n' ||
            'O entregador já está a caminho com seu pedido.' || E'\n\n' ||
            '⏱️';
        ELSE
          mensagem_cliente :=
            '✅ *Seu pedido está pronto!*' || E'\n\n' ||
            'Venha retirar seu lanche!! 🍔' || E'\n\n' ||
            '🍔';
        END IF;
      ELSE
        mensagem_cliente :=
          '📦 *' || NEW.cliente || '*' || E'\n\n' ||
          'Status do seu pedido: ' || NEW.status;
    END CASE;
    INSERT INTO whatsapp_notifications
      (pedido_id, cliente, phone, message, status_anterior, status_novo, created_at)
    VALUES
      (NEW.id, NEW.cliente, NEW.phone, mensagem_cliente, OLD.status, NEW.status, NOW());
  END IF;
  RETURN NEW;
END;
$$;

COMMENT ON FUNCTION public.enqueue_whatsapp_notification() IS 
  'Função consolidada: enfileira notificações WhatsApp para INSERT (novo pedido) e UPDATE (mudança de status). Evita duplicação.';

CREATE TRIGGER trg_whatsapp_notification
AFTER INSERT OR UPDATE ON public.pedidos
FOR EACH ROW
EXECUTE FUNCTION public.enqueue_whatsapp_notification();

COMMENT ON TRIGGER trg_whatsapp_notification ON public.pedidos IS 
  'Trigger consolidada: enfileira notificações para novo pedido (INSERT) ou mudança de status (UPDATE).';

-- 049: Adicionar tempo_espera_padrao no store_status
-- ============================================
ALTER TABLE store_status 
ADD COLUMN IF NOT EXISTS tempo_espera_padrao INTEGER NOT NULL DEFAULT 40;

COMMENT ON COLUMN store_status.tempo_espera_padrao IS 
  'Tempo de espera em minutos definido pelo admin. Usado como padrão para novos pedidos e exibido no cardápio.';

-- 050: Split endereco (numero, bairro)
-- ============================================
ALTER TABLE pedidos ADD COLUMN IF NOT EXISTS numero TEXT;
ALTER TABLE pedidos ADD COLUMN IF NOT EXISTS bairro TEXT;
CREATE INDEX IF NOT EXISTS idx_pedidos_bairro ON pedidos(bairro) WHERE bairro IS NOT NULL;
COMMENT ON COLUMN pedidos.numero IS 'Número do imóvel para entrega (novo campo - substitui uso de endereco)';
COMMENT ON COLUMN pedidos.bairro IS 'Bairro para entrega (novo campo - substitui uso de endereco)';

-- ============================================
-- FIM DA MIGRATION UNIFICADA 040-050
-- ============================================
