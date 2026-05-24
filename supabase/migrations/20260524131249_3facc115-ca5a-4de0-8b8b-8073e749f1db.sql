
-- 1) site_settings: restrict public read to whitelist
DROP POLICY IF EXISTS "Public views settings" ON public.site_settings;
CREATE POLICY "Public views safe settings"
ON public.site_settings
FOR SELECT
USING (
  key IN (
    'logo_url','brand_name','contact_phone','contact_email','contact_whatsapp',
    'chatbot_enabled','chatbot_welcome_bn','chatbot_welcome_en','hero_stats'
  )
  OR has_role(auth.uid(), 'admin'::app_role)
);

-- 2) chat_messages: ensure conversation exists and is recent/open
CREATE OR REPLACE FUNCTION public.can_insert_chat_message(_conversation_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.chat_conversations c
    WHERE c.id = _conversation_id
      AND c.status = 'open'
      AND c.created_at > now() - interval '24 hours'
  )
$$;

REVOKE EXECUTE ON FUNCTION public.can_insert_chat_message(uuid) FROM PUBLIC, anon, authenticated;

DROP POLICY IF EXISTS "Anyone insert messages" ON public.chat_messages;
CREATE POLICY "Insert messages into valid conversation"
ON public.chat_messages
FOR INSERT
WITH CHECK (
  length(content) >= 1
  AND length(content) <= 5000
  AND public.can_insert_chat_message(conversation_id)
);

-- 3) Lock down SECURITY DEFINER functions from direct API access
-- has_role and can_insert_order_item are used inside RLS USING/WITH CHECK, which run as the policy evaluator and still work after revoking EXECUTE from anon/authenticated.
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, app_role) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.can_insert_order_item(uuid) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.set_updated_at() FROM PUBLIC, anon, authenticated;

-- claim_first_admin must remain callable by signed-in users (one-time bootstrap)
REVOKE EXECUTE ON FUNCTION public.claim_first_admin() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.claim_first_admin() TO authenticated;
