-- Migration: Deixar todos os valores da coluna ingrediente em letras minúsculas
-- Data: 26/01/2026

UPDATE ingredientes_indisponiveis_dia
SET ingrediente = LOWER(ingrediente);
