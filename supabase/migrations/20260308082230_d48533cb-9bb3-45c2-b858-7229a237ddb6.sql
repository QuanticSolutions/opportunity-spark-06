
-- Remove the overly permissive update policy
DROP POLICY IF EXISTS "Anyone can increment view count" ON public.opportunities;

-- Create a secure function to increment view count
CREATE OR REPLACE FUNCTION public.increment_opportunity_views(opp_id uuid)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  UPDATE opportunities SET views_count = views_count + 1 WHERE id = opp_id;
$$;
