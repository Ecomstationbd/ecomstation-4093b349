
CREATE TABLE public.abandoned_checkouts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_name TEXT,
  customer_phone TEXT,
  customer_email TEXT,
  customer_address TEXT,
  notes TEXT,
  cart_items JSONB NOT NULL DEFAULT '[]'::jsonb,
  subtotal NUMERIC NOT NULL DEFAULT 0,
  completed BOOLEAN NOT NULL DEFAULT false,
  user_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.abandoned_checkouts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone create abandoned checkout"
ON public.abandoned_checkouts FOR INSERT
WITH CHECK (
  (customer_name IS NULL OR length(customer_name) <= 200)
  AND (customer_phone IS NULL OR length(customer_phone) <= 30)
  AND (customer_email IS NULL OR length(customer_email) <= 255)
  AND (customer_address IS NULL OR length(customer_address) <= 1000)
  AND (notes IS NULL OR length(notes) <= 2000)
);

CREATE POLICY "Anyone update recent abandoned checkout"
ON public.abandoned_checkouts FOR UPDATE
USING (created_at > now() - interval '24 hours')
WITH CHECK (
  (customer_name IS NULL OR length(customer_name) <= 200)
  AND (customer_phone IS NULL OR length(customer_phone) <= 30)
  AND (customer_email IS NULL OR length(customer_email) <= 255)
  AND (customer_address IS NULL OR length(customer_address) <= 1000)
  AND (notes IS NULL OR length(notes) <= 2000)
);

CREATE POLICY "Admins view abandoned checkouts"
ON public.abandoned_checkouts FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins delete abandoned checkouts"
ON public.abandoned_checkouts FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER update_abandoned_checkouts_updated_at
BEFORE UPDATE ON public.abandoned_checkouts
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE INDEX idx_abandoned_checkouts_created_at ON public.abandoned_checkouts(created_at DESC);
CREATE INDEX idx_abandoned_checkouts_completed ON public.abandoned_checkouts(completed);
