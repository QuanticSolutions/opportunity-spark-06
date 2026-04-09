
CREATE TABLE public.site_pages (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  slug text NOT NULL UNIQUE,
  title text NOT NULL,
  content text,
  updated_by uuid REFERENCES auth.users(id),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.site_pages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view site pages" ON public.site_pages
  FOR SELECT TO public USING (true);

CREATE POLICY "Admins can insert site pages" ON public.site_pages
  FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'::app_role));

CREATE POLICY "Admins can update site pages" ON public.site_pages
  FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'::app_role));

CREATE POLICY "Admins can delete site pages" ON public.site_pages
  FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'::app_role));

-- Seed default pages
INSERT INTO public.site_pages (slug, title, content) VALUES
  ('terms', 'Terms of Service', NULL),
  ('privacy', 'Privacy Policy', NULL);
