
CREATE TABLE public.blogs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  title_bn TEXT NOT NULL,
  title_en TEXT NOT NULL,
  excerpt_bn TEXT,
  excerpt_en TEXT,
  content_bn TEXT,
  content_en TEXT,
  cover_url TEXT,
  tags TEXT[] NOT NULL DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'draft',
  author_name TEXT,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.blogs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public views published blogs"
  ON public.blogs FOR SELECT
  USING (status = 'published' OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins manage blogs"
  ON public.blogs FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER blogs_set_updated_at
  BEFORE UPDATE ON public.blogs
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE INDEX idx_blogs_status_published ON public.blogs(status, published_at DESC);
