-- POLICIES para whatsapp_notifications
-- Permite leitura para todos, escrita apenas para funções/autorizados

-- Permitir SELECT para todos
CREATE POLICY "Allow read whatsapp_notifications" ON public.whatsapp_notifications
  FOR SELECT USING (true);

-- Permitir INSERT apenas para usuários autenticados
CREATE POLICY "Allow insert whatsapp_notifications" ON public.whatsapp_notifications
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Permitir UPDATE apenas para admin
CREATE POLICY "Allow update whatsapp_notifications admin" ON public.whatsapp_notifications
  FOR UPDATE USING (auth.role() = 'admin');

-- Permitir DELETE apenas para admin
CREATE POLICY "Allow delete whatsapp_notifications admin" ON public.whatsapp_notifications
  FOR DELETE USING (auth.role() = 'admin');

-- POLICIES para produtos_disponibilidade
-- Permite leitura para todos, escrita apenas para autenticados

CREATE POLICY "Allow read produtos_disponibilidade" ON public.produtos_disponibilidade
  FOR SELECT USING (true);

CREATE POLICY "Allow insert produtos_disponibilidade" ON public.produtos_disponibilidade
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow update produtos_disponibilidade" ON public.produtos_disponibilidade
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Allow delete produtos_disponibilidade admin" ON public.produtos_disponibilidade
  FOR DELETE USING (auth.role() = 'admin');
