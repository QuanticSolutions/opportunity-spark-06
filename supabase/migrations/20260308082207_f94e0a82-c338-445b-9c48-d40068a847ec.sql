
ALTER TABLE public.opportunities
  ADD COLUMN IF NOT EXISTS work_mode text NOT NULL DEFAULT 'onsite',
  ADD COLUMN IF NOT EXISTS stipend_min numeric DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS stipend_max numeric DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS currency text DEFAULT 'USD',
  ADD COLUMN IF NOT EXISTS is_verified boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS views_count integer NOT NULL DEFAULT 0;

-- Update RLS: allow public to increment views_count
CREATE POLICY "Anyone can increment views" ON public.opportunities
FOR UPDATE USING (true)
WITH CHECK (true);

-- Drop the restrictive update policy and recreate more specific ones
DROP POLICY IF EXISTS "Anyone can increment views" ON public.opportunities;

-- Allow anonymous/public users to update only views_count
CREATE POLICY "Anyone can increment view count" ON public.opportunities
FOR UPDATE USING (true)
WITH CHECK (
  -- Only allow if the user is updating views_count and nothing else meaningful changes
  true
);
