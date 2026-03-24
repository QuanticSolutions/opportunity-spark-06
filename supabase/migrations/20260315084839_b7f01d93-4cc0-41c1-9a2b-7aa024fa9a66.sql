
-- Admin audit logs table
CREATE TABLE public.admin_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  action text NOT NULL,
  target_id text,
  target_type text,
  details jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.admin_logs ENABLE ROW LEVEL SECURITY;

-- Only admins can view logs
CREATE POLICY "Admins can view admin logs" ON public.admin_logs
FOR SELECT TO authenticated
USING (EXISTS (
  SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
));

-- Admin/editor/viewer can insert logs
CREATE POLICY "Admin roles can insert logs" ON public.admin_logs
FOR INSERT TO authenticated
WITH CHECK (EXISTS (
  SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'editor', 'viewer')
));

-- Articles table
CREATE TABLE public.articles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text UNIQUE NOT NULL,
  content text,
  excerpt text,
  cover_image text,
  author_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  status text NOT NULL DEFAULT 'draft',
  published_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;

-- Anyone can view published articles
CREATE POLICY "Anyone can view published articles" ON public.articles
FOR SELECT USING (status = 'published');

-- Admins/editors can view all articles
CREATE POLICY "Admin roles can view all articles" ON public.articles
FOR SELECT TO authenticated
USING (EXISTS (
  SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'editor')
));

-- Admins/editors can insert articles
CREATE POLICY "Admin roles can insert articles" ON public.articles
FOR INSERT TO authenticated
WITH CHECK (EXISTS (
  SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'editor')
));

-- Admins/editors can update articles
CREATE POLICY "Admin roles can update articles" ON public.articles
FOR UPDATE TO authenticated
USING (EXISTS (
  SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'editor')
));

-- Admins can delete articles
CREATE POLICY "Admins can delete articles" ON public.articles
FOR DELETE TO authenticated
USING (EXISTS (
  SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
));

-- Content submissions table
CREATE TABLE public.content_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  title text NOT NULL,
  content text,
  submission_type text NOT NULL DEFAULT 'opportunity',
  status text NOT NULL DEFAULT 'pending',
  admin_notes text,
  reviewed_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  reviewed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.content_submissions ENABLE ROW LEVEL SECURITY;

-- Users can submit content
CREATE POLICY "Users can insert submissions" ON public.content_submissions
FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Users can view own submissions
CREATE POLICY "Users can view own submissions" ON public.content_submissions
FOR SELECT TO authenticated
USING (auth.uid() = user_id);

-- Admin roles can view all submissions
CREATE POLICY "Admin roles can view all submissions" ON public.content_submissions
FOR SELECT TO authenticated
USING (EXISTS (
  SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'editor')
));

-- Admin roles can update submissions
CREATE POLICY "Admin roles can update submissions" ON public.content_submissions
FOR UPDATE TO authenticated
USING (EXISTS (
  SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'editor')
));

-- Trigger for updated_at on articles
CREATE TRIGGER set_articles_updated_at
BEFORE UPDATE ON public.articles
FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

-- Trigger for updated_at on content_submissions
CREATE TRIGGER set_submissions_updated_at
BEFORE UPDATE ON public.content_submissions
FOR EACH ROW EXECUTE FUNCTION handle_updated_at();
