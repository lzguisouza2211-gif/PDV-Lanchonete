-- Migration 035
-- Adiciona suporte a emojis em mensagens WhatsApp.
-- Data: 2026-01-28
CREATE OR REPLACE FUNCTION public.format_pedido_itens(itens JSONB)
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  item JSONB;
  result TEXT := '';
  nome TEXT;
  categoria TEXT;
  emoji TEXT;
BEGIN
  FOR item IN SELECT * FROM jsonb_array_elements(itens)
  LOOP
    nome := lower(item->>'nome');
    categoria := lower(item->>'categoria');

    -- Emojis específicos para cada categoria do sistema
    IF categoria = 'lanches' THEN
      emoji := '🍔';
    ELSIF categoria = 'macarrão' OR categoria = 'macarrao' THEN
      emoji := '🍝';
    ELSIF categoria = 'porções' OR categoria = 'porcao' OR categoria = 'porções' THEN
      emoji := '🍟';
    ELSIF categoria = 'omeletes' THEN
      emoji := '🍳';
    ELSIF categoria = 'bebidas' THEN
      emoji := '🥤';
    ELSIF categoria = 'cervejas' THEN
      emoji := '🍺';
    ELSIF categoria = 'doces' THEN
      emoji := '🍬';
    ELSE
      emoji := '🍽️';
    END IF;

    result := result ||
      emoji || ' ' ||
      initcap(item->>'nome') || ' x' || (item->>'quantidade') || E'\n';
  END LOOP;
  RETURN result;
END;
$$;