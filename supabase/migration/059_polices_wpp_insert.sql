--cria police para anon inserir na tabela wpp

create policy "anon_can_insert_whatsapp_notifications"
on whatsapp_notifications
for insert
to anon
with check (true);