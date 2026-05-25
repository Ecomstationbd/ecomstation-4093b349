CREATE TABLE public.service_partners (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  logo_url TEXT,
  link_url TEXT,
  color TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.service_partners ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public views active partners"
  ON public.service_partners FOR SELECT
  USING (is_active = true OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins manage partners"
  ON public.service_partners FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER set_service_partners_updated_at
  BEFORE UPDATE ON public.service_partners
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

INSERT INTO public.service_partners (name, logo_url, color, sort_order) VALUES
  ('WordPress', 'https://cdn.simpleicons.org/wordpress/21759B', '#21759B', 1),
  ('Shopify', 'https://cdn.simpleicons.org/shopify/7AB55C', '#7AB55C', 2),
  ('Lovable', NULL, '#FF4081', 3),
  ('Google Tag Manager', 'https://cdn.simpleicons.org/googletagmanager/246FDB', '#246FDB', 4),
  ('Microsoft Clarity', NULL, '#00A4EF', 5),
  ('Meta Ads', 'https://cdn.simpleicons.org/meta/0467DF', '#0467DF', 6),
  ('TikTok Ads', 'https://cdn.simpleicons.org/tiktok/000000', '#000000', 7),
  ('step.io', NULL, '#6366F1', 8);