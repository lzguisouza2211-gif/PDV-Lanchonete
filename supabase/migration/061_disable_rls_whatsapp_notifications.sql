-- Migration 061
-- Solução final: Desabilitar RLS na tabela whatsapp_notifications
-- Motivo: A tabela é apenas para notificações internas geradas pelo sistema.
-- Não há risco de segurança pois é controlada apenas por triggers do servidor.
-- Data: 2026-02-01

-- Desabilitar RLS
ALTER TABLE whatsapp_notifications DISABLE ROW LEVEL SECURITY;
