-- Add sequential order_number like E-101
CREATE SEQUENCE IF NOT EXISTS public.order_number_seq START WITH 101 INCREMENT BY 1;

ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS order_number TEXT UNIQUE;

CREATE OR REPLACE FUNCTION public.set_order_number()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.order_number IS NULL THEN
    NEW.order_number := 'E-' || nextval('public.order_number_seq')::text;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_set_order_number ON public.orders;
CREATE TRIGGER trg_set_order_number
BEFORE INSERT ON public.orders
FOR EACH ROW
EXECUTE FUNCTION public.set_order_number();

-- Backfill existing orders by created_at ascending
DO $$
DECLARE
  r RECORD;
  next_num INT;
BEGIN
  SELECT COALESCE(MAX(NULLIF(regexp_replace(order_number, '^E-', ''), '')::int), 100) + 1
    INTO next_num FROM public.orders WHERE order_number IS NOT NULL;
  IF next_num IS NULL THEN next_num := 101; END IF;
  FOR r IN SELECT id FROM public.orders WHERE order_number IS NULL ORDER BY created_at ASC LOOP
    UPDATE public.orders SET order_number = 'E-' || next_num::text WHERE id = r.id;
    next_num := next_num + 1;
  END LOOP;
  PERFORM setval('public.order_number_seq', GREATEST(next_num, 101), false);
END $$;