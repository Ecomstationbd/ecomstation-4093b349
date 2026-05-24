
GRANT EXECUTE ON FUNCTION public.has_role(uuid, app_role) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.can_insert_order_item(uuid) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.can_insert_chat_message(uuid) TO anon, authenticated;
