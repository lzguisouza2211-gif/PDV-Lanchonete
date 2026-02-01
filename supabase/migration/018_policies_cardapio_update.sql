-- Migration 018
-- Políticas para atualização do cardápio.
-- Data: 2026-01-28
-- Migration 018: Adicionar policies de UPDATE para cardapio
-- Permite que admins atualizem campos como 'disponivel'

-- Remover policies antigas conflitantes
DROP POLICY IF EXISTS "public_select_cardapio" ON cardapio;

-- Policy de SELECT para público (anon e authenticated)
CREATE POLICY "public_select_cardapio"
ON cardapio
FOR SELECT
USING (true);

-- Policy de UPDATE para admins (apenas disponivel e outros campos)
CREATE POLICY "admin_update_cardapio"
ON cardapio
FOR UPDATE
USING (
  auth.uid() IN (
    SELECT user_id FROM admins WHERE ativo = true
  )
)
WITH CHECK (
  auth.uid() IN (
    SELECT user_id FROM admins WHERE ativo = true
  )
);

-- Policy de INSERT para admins
CREATE POLICY "admin_insert_cardapio"
ON cardapio
FOR INSERT
WITH CHECK (
  auth.uid() IN (
    SELECT user_id FROM admins WHERE ativo = true
  )
);

-- Policy de DELETE para admins
CREATE POLICY "admin_delete_cardapio"
ON cardapio
FOR DELETE
USING (
  auth.uid() IN (
    SELECT user_id FROM admins WHERE ativo = true
  )
);
