-- Categories table
CREATE TABLE public.categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  name_bn TEXT NOT NULL,
  name_en TEXT NOT NULL,
  description_bn TEXT,
  description_en TEXT,
  image_url TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public views active categories" ON public.categories FOR SELECT USING (is_active = true OR has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage categories" ON public.categories FOR ALL USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));
CREATE TRIGGER trg_categories_updated BEFORE UPDATE ON public.categories FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Products: add slug, category_id, long description (description_bn/en already exist)
ALTER TABLE public.products
  ADD COLUMN slug TEXT,
  ADD COLUMN category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  ADD COLUMN gallery JSONB NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN stock INTEGER;

-- Backfill slugs from name_en
UPDATE public.products SET slug = lower(regexp_replace(coalesce(name_en, id::text), '[^a-zA-Z0-9]+', '-', 'g')) || '-' || substr(id::text, 1, 6) WHERE slug IS NULL;
ALTER TABLE public.products ALTER COLUMN slug SET NOT NULL;
CREATE UNIQUE INDEX products_slug_key ON public.products(slug);

-- Product variants
CREATE TABLE public.product_variants (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  name_bn TEXT NOT NULL,
  name_en TEXT NOT NULL,
  price_delta NUMERIC NOT NULL DEFAULT 0,
  stock INTEGER,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public views variants" ON public.product_variants FOR SELECT USING (true);
CREATE POLICY "Admins manage variants" ON public.product_variants FOR ALL USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));

-- Services: long content + features + image
ALTER TABLE public.services
  ADD COLUMN content_bn TEXT,
  ADD COLUMN content_en TEXT,
  ADD COLUMN image_url TEXT,
  ADD COLUMN features JSONB NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN price_text TEXT;