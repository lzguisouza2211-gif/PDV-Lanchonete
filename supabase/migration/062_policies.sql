-- Name: admin_can_update_whatsapp_notifications; Type: POLICY; Schema: public; Owner: postgres
alter policy "admin_can_delete_whatsapp_notifications"


on "public"."whatsapp_notifications"


to authenticated


using (

  (EXISTS ( SELECT 1
   FROM admins
  WHERE ((admins.user_id = auth.uid()) AND (admins.ativo = true))))

);

-- polocy para admin atualizar whatsapp_notifications
alter policy "admin_can_update_whatsapp_notifications"


on "public"."whatsapp_notifications"


to authenticated


using (

  (EXISTS ( SELECT 1
   FROM admins
  WHERE ((admins.user_id = auth.uid()) AND (admins.ativo = true))))

) with check (

  (EXISTS (
    SELECT 1
    FROM admins
    WHERE ((admins.user_id = auth.uid()) AND (admins.ativo = true))
  ))

);


--policy para permitir delete para admin 
alter policy "Allow delete whatsapp_notifications admin"


on "public"."whatsapp_notifications"


to public


using (

  (auth.role() = 'admin'::text)

);

--insere policy para permitir insert para authenticated
alter policy "Allow insert whatsapp_notifications"


on "public"."whatsapp_notifications"


to public


with check (

  (auth.role() = 'authenticated'::text)

);

-- 5
alter policy "Allow read whatsapp_notifications"


on "public"."whatsapp_notifications"


to public


using (

  true

);


--6
alter policy "Allow update whatsapp_notifications admin"


on "public"."whatsapp_notifications"


to public


using (

  (auth.role() = 'admin'::text)

);


--7
alter policy "allow_select_whatsapp_notifications"


on "public"."whatsapp_notifications"


to public


using (

  true

);


--8
alter policy "anon_can_insert_whatsapp_notifications"


on "public"."whatsapp_notifications"


to anon


with check (

  true

);

--9
alter policy "authenticated_can_insert_whatsapp_notifications"


on "public"."whatsapp_notifications"


to authenticated


with check (

  true

);