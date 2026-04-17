-- Allow authenticated users to view minimal public profile info of other users
-- (needed for chat partner names/avatars)
CREATE POLICY "Authenticated users can view public profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (true);