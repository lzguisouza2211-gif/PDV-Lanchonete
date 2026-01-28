-- Migration 026
-- Criação de triggers para debug e auditoria.
-- Data: 2026-01-28
-- Verificar todos os triggers na tabela pedidos
SELECT 
    t.tgname AS trigger_name,
    p.proname AS function_name
FROM pg_trigger t
JOIN pg_proc p ON t.tgfoid = p.oid
JOIN pg_class c ON t.tgrelid = c.oid
WHERE c.relname = 'pedidos'
  AND t.tgisinternal = false;

-- Depois, para cada trigger encontrado acima, rode:
-- DROP TRIGGER IF EXISTS nome_do_trigger ON public.pedidos;
