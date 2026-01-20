-- Remove status "confirmação" remapping to "Em preparo" and drop old trigger

-- Atualiza registros existentes
update pedidos
set status = 'Em preparo'
where status in ('confirmação', 'Confirmacao');

-- Remove trigger e função antigos relacionados a confirmação
drop trigger if exists trg_notify_pedido_confirmado on public.pedidos;
drop function if exists public.notify_pedido_confirmado();
