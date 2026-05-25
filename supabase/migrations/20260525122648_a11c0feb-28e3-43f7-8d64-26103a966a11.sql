CREATE TABLE public.menu_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  label_en TEXT NOT NULL,
  label_bn TEXT NOT NULL,
  href TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  open_in_new_tab BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.menu_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public views active menu items" ON public.menu_items
  FOR SELECT USING (is_active = true OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins manage menu items" ON public.menu_items
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER set_menu_items_updated_at
  BEFORE UPDATE ON public.menu_items
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

INSERT INTO public.menu_items (label_en, label_bn, href, sort_order) VALUES
  ('Services', 'সার্ভিস', '/#services', 1),
  ('Shop', 'শপ', '/#shop', 2),
  ('Blog', 'ব্লগ', '/blog', 3),
  ('Why Us', 'কেন আমরা', '/#why', 4),
  ('Testimonials', 'প্রশংসা', '/#testimonials', 5),
  ('Contact', 'যোগাযোগ', '/#contact', 6);