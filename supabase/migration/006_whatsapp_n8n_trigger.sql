-- ============================================
-- TRIGGER PARA NOTIFICAÇÃO N8N
-- ============================================

create or replace function public.notify_pedido_confirmado()
returns trigger
language plpgsql
as $$
begin
  -- só quando o status muda para Confirmacao
  if new.status = 'Confirmacao'
     and old.status is distinct from new.status then

    perform
      net.http_post(
        url := 'https://pdv-lanchonete.app.n8n.cloud/webhook-test/pedido-confirmado',
        headers := jsonb_build_object(
          'Content-Type', 'application/json'
        ),
        body := jsonb_build_object(
          'pedido_id', new.id,
          'cliente', new.cliente,
          'total', new.total,
          'tipoentrega', new.tipoentrega,
          'endereco', new.endereco,
          'formapagamento', new.formapagamento
        -- Migration 006
        -- Criação de trigger para notificação de pedidos confirmados via N8N.
        -- Data: 2026-01-28
        )
  end if;

  return new;
end;
$$;

drop trigger if exists trg_notify_pedido_confirmado on pedidos;

create trigger trg_notify_pedido_confirmado
after update on pedidos
for each row
execute function public.notify_pedido_confirmado();

