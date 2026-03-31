
-- Add missing columns to applications table
ALTER TABLE public.applications ADD COLUMN IF NOT EXISTS name text;
ALTER TABLE public.applications ADD COLUMN IF NOT EXISTS email text;
ALTER TABLE public.applications ADD COLUMN IF NOT EXISTS phone text;
ALTER TABLE public.applications ADD COLUMN IF NOT EXISTS resume_url text;

-- Create resumes storage bucket (private)
INSERT INTO storage.buckets (id, name, public) VALUES ('resumes', 'resumes', false) ON CONFLICT (id) DO NOTHING;

-- RLS policies for resumes bucket
CREATE POLICY "Authenticated users can upload resumes" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'resumes');
CREATE POLICY "Users can view own resumes" ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'resumes' AND (auth.uid()::text = (storage.foldername(name))[1]));
CREATE POLICY "Providers and admins can view resumes" ON storage.objects FOR SELECT TO authenticated USING (
  bucket_id = 'resumes' AND (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'editor')) OR
    EXISTS (
      SELECT 1 FROM applications a
      JOIN opportunities o ON o.id = a.opportunity_id
      WHERE a.resume_url = name AND o.provider_id = auth.uid()
    )
  )
);

-- Allow anon users to insert applications (for guest apply)
CREATE POLICY "Anyone can insert applications" ON public.applications FOR INSERT TO anon WITH CHECK (true);

-- Allow admins to view all applications
CREATE POLICY "Admins can view all applications" ON public.applications FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'::app_role)
);

-- Allow anon to upload resumes
CREATE POLICY "Anon users can upload resumes" ON storage.objects FOR INSERT TO anon WITH CHECK (bucket_id = 'resumes');
