
-- Restrict has_role execution
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, app_role) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, app_role) TO authenticated;

-- set_updated_at search_path
CREATE OR REPLACE FUNCTION public.set_updated_at() RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

-- Tighten public insert policies with length checks
DROP POLICY "Anyone submits orders" ON public.orders;
CREATE POLICY "Anyone submits orders" ON public.orders FOR INSERT
  WITH CHECK (
    length(customer_name) BETWEEN 1 AND 200
    AND length(customer_phone) BETWEEN 5 AND 30
    AND (customer_email IS NULL OR length(customer_email) <= 255)
    AND (customer_address IS NULL OR length(customer_address) <= 1000)
    AND (notes IS NULL OR length(notes) <= 2000)
  );

DROP POLICY "Anyone inserts order items" ON public.order_items;
CREATE POLICY "Anyone inserts order items" ON public.order_items FOR INSERT
  WITH CHECK (
    length(product_name) BETWEEN 1 AND 300
    AND quantity > 0 AND quantity <= 1000
    AND price >= 0
  );

DROP POLICY "Anyone submits contact" ON public.contact_messages;
CREATE POLICY "Anyone submits contact" ON public.contact_messages FOR INSERT
  WITH CHECK (
    length(name) BETWEEN 1 AND 200
    AND length(message) BETWEEN 1 AND 5000
    AND (email IS NULL OR length(email) <= 255)
    AND (phone IS NULL OR length(phone) <= 30)
    AND (subject IS NULL OR length(subject) <= 300)
  );

-- Restrict storage public listing: keep public read by id (object SELECT remains for public via bucket public flag)
-- Limit object listing to admins only on this bucket
DROP POLICY "Public read site-assets" ON storage.objects;
CREATE POLICY "Public read site-assets" ON storage.objects FOR SELECT USING (
  bucket_id = 'site-assets' AND (
    public.has_role(auth.uid(),'admin')
    OR auth.role() = 'anon'
    OR auth.role() = 'authenticated'
  )
);
