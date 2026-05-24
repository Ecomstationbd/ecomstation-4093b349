CREATE OR REPLACE FUNCTION public.can_insert_order_item(_order_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.orders o
    WHERE o.id = _order_id
      AND (
        o.user_id = auth.uid()
        OR o.created_at > now() - interval '10 minutes'
      )
  )
$$;