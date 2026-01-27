-- Permitir SELECT para admins ativos
CREATE POLICY admin_select_ingredientes_indisponiveis
ON public.ingredientes_indisponiveis_dia
FOR SELECT
TO authenticated
USING (
  auth.uid() IN (
    SELECT user_id FROM admins WHERE ativo = true
  )
);

-- Permitir INSERT para admins ativos
CREATE POLICY admin_insert_ingredientes_indisponiveis
ON public.ingredientes_indisponiveis_dia
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() IN (
    SELECT user_id FROM admins WHERE ativo = true
  )
);

-- Permitir UPDATE para admins ativos
CREATE POLICY admin_update_ingredientes_indisponiveis
ON public.ingredientes_indisponiveis_dia
FOR UPDATE
TO authenticated
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