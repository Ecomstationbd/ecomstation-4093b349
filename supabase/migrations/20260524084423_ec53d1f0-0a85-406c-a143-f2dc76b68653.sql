
CREATE OR REPLACE FUNCTION public.can_insert_order_item(_order_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.orders o
    WHERE o.id = _order_id
      AND (
        o.user_id = auth.uid()
        OR (o.user_id IS NULL AND o.created_at > now() - interval '10 minutes')
      )
  )
$$;

GRANT EXECUTE ON FUNCTION public.can_insert_order_item(uuid) TO anon, authenticated;

DROP POLICY IF EXISTS "Insert order items for own order" ON public.order_items;

CREATE POLICY "Insert order items for own order"
ON public.order_items
FOR INSERT
WITH CHECK (
  length(product_name) >= 1
  AND length(product_name) <= 300
  AND quantity > 0
  AND quantity <= 1000
  AND price >= 0
  AND public.can_insert_order_item(order_id)
);
