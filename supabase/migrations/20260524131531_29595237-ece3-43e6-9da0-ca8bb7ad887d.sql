
DROP POLICY IF EXISTS "Public views variants" ON public.product_variants;

CREATE POLICY "Public views active variants"
ON public.product_variants
FOR SELECT
USING (
  has_role(auth.uid(), 'admin'::app_role)
  OR (
    is_active = true
    AND EXISTS (
      SELECT 1 FROM public.products p
      WHERE p.id = product_variants.product_id
        AND p.is_active = true
    )
  )
);
