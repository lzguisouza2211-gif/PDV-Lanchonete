-- Migration 045; para garantir que todos os registros existentes tenham valor correto na coluna 'indisponivel'
-- (Opcional, caso precise corrigir dados legados)

UPDATE ingredientes_indisponiveis_dia
SET indisponivel = true
WHERE indisponivel IS NULL;

-- A partir de agora, o front e backend devem SEMPRE usar o valor da coluna 'indisponivel' para determinar se o ingrediente está ou não disponível.
-- O front nunca deve assumir indisponibilidade apenas pela existência do registro, mas sim pelo valor do campo.
