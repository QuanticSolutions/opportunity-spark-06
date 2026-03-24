
CREATE TABLE public.technical_writing_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text NOT NULL,
  organization_name text NOT NULL,
  email text NOT NULL,
  project_type text,
  description text,
  deadline timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.technical_writing_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert technical writing requests"
ON public.technical_writing_requests
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

CREATE POLICY "Admins can view technical writing requests"
ON public.technical_writing_requests
FOR SELECT
TO authenticated
USING (EXISTS (
  SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'::app_role
));
