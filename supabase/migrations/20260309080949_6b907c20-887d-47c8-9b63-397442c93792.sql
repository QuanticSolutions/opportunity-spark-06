
-- Tighten admin_notifications insert: only the provider themselves can create their own notification
DROP POLICY "Authenticated users can insert admin notifications" ON public.admin_notifications;
CREATE POLICY "Providers can insert own admin notifications" ON public.admin_notifications
  FOR INSERT TO authenticated
  WITH CHECK (provider_id = auth.uid());

-- Tighten audit logs insert: only subscription owner can insert audit logs for their subscription
DROP POLICY "Authenticated users can insert audit logs" ON public.subscription_audit_logs;
CREATE POLICY "Subscription owners can insert audit logs" ON public.subscription_audit_logs
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.provider_subscriptions ps WHERE ps.id = subscription_audit_logs.subscription_id AND ps.provider_id = auth.uid())
    OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );
