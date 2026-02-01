-- Migration 012
-- Criação da tabela de ingredientes do cardápio.
-- Data: 2026-01-28
-- ============================================
-- ADICIONAR CAMPO INGREDIENTES AO CARDÁPIO
-- ============================================
-- Permite armazenar lista de ingredientes por produto para remoção

alter table cardapio 
add column if not exists ingredientes jsonb default '[]'::jsonb;

-- Comentário na coluna
comment on column cardapio.ingredientes is 'Array JSON de ingredientes do produto. Ex: ["Alface", "Tomate", "Cebola", "Milho", "Picles", "Maionese"]';

