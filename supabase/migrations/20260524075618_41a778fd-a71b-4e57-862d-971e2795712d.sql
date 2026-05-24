-- 1. Chat tables: restrict SELECT to admins only
DROP POLICY IF EXISTS "Anyone read conversation" ON public.chat_conversations;
DROP POLICY IF EXISTS "Anyone read messages" ON public.chat_messages;

CREATE POLICY "Admins read conversations" ON public.chat_conversations
  FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins read messages" ON public.chat_messages
  FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

-- 2. Tighten order_items insert: must reference an order owned by the same user
--    or an anonymous order created within the last 5 minutes (checkout window).
DROP POLICY IF EXISTS "Anyone inserts order items" ON public.order_items;
CREATE POLICY "Insert order items for own order" ON public.order_items
  FOR INSERT WITH CHECK (
    length(product_name) BETWEEN 1 AND 300
    AND quantity > 0 AND quantity <= 1000
    AND price >= 0
    AND EXISTS (
      SELECT 1 FROM public.orders o
      WHERE o.id = order_items.order_id
        AND (
          o.user_id = auth.uid()
          OR (o.user_id IS NULL AND o.created_at > now() - interval '5 minutes')
        )
    )
  );

-- 3. Revoke public EXECUTE on SECURITY DEFINER functions that should not be
--    callable directly via PostgREST. They still work inside RLS policies and
--    triggers because those run under the function owner.
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;

-- claim_first_admin must remain callable by signed-in users (first admin claim flow)
REVOKE EXECUTE ON FUNCTION public.claim_first_admin() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.claim_first_admin() TO authenticated;