-- Allow providers to delete their own subscription so they can start a fresh request flow
CREATE POLICY "Providers can delete own subscription"
ON public.provider_subscriptions
FOR DELETE
TO authenticated
USING (auth.uid() = provider_id);

-- Allow admins to delete subscriptions too (for cleanup)
CREATE POLICY "Admins can delete subscriptions"
ON public.provider_subscriptions
FOR DELETE
TO authenticated
USING (EXISTS (
  SELECT 1 FROM public.profiles
  WHERE profiles.id = auth.uid() AND profiles.role = 'admin'::app_role
));

-- Allow providers to delete their own subscription audit logs (so deleting the sub doesn't fail on FK-less orphans)
CREATE POLICY "Providers can delete own audit logs"
ON public.subscription_audit_logs
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.provider_subscriptions ps
    WHERE ps.id = subscription_audit_logs.subscription_id
      AND ps.provider_id = auth.uid()
  )
  OR EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid() AND profiles.role = 'admin'::app_role
  )
);