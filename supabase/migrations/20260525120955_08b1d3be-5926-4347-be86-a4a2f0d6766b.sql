ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS meta_title TEXT,
  ADD COLUMN IF NOT EXISTS meta_description TEXT,
  ADD COLUMN IF NOT EXISTS meta_keywords TEXT,
  ADD COLUMN IF NOT EXISTS og_image_url TEXT;