
-- Add new columns to provider_subscriptions
ALTER TABLE public.provider_subscriptions 
  ADD COLUMN IF NOT EXISTS payment_status text NOT NULL DEFAULT 'awaiting_payment',
  ADD COLUMN IF NOT EXISTS receipt_url text,
  ADD COLUMN IF NOT EXISTS admin_notes text,
  ADD COLUMN IF NOT EXISTS approved_by uuid,
  ADD COLUMN IF NOT EXISTS approved_at timestamp with time zone;

-- Create admin_notifications table
CREATE TABLE IF NOT EXISTS public.admin_notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  type text NOT NULL DEFAULT 'subscription_request',
  message text NOT NULL,
  is_read boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.admin_notifications ENABLE ROW LEVEL SECURITY;

-- Admins can read all admin notifications
CREATE POLICY "Admins can view admin notifications" ON public.admin_notifications
  FOR SELECT TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Admins can update admin notifications
CREATE POLICY "Admins can update admin notifications" ON public.admin_notifications
  FOR UPDATE TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- System can insert admin notifications (via service role or triggers)
CREATE POLICY "Authenticated users can insert admin notifications" ON public.admin_notifications
  FOR INSERT TO authenticated
  WITH CHECK (true);

-- Create subscription_audit_logs table
CREATE TABLE IF NOT EXISTS public.subscription_audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  subscription_id uuid NOT NULL REFERENCES public.provider_subscriptions(id) ON DELETE CASCADE,
  action text NOT NULL,
  admin_id uuid,
  notes text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.subscription_audit_logs ENABLE ROW LEVEL SECURITY;

-- Admins can view audit logs
CREATE POLICY "Admins can view audit logs" ON public.subscription_audit_logs
  FOR SELECT TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Providers can view their own audit logs
CREATE POLICY "Providers can view own audit logs" ON public.subscription_audit_logs
  FOR SELECT TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.provider_subscriptions ps WHERE ps.id = subscription_audit_logs.subscription_id AND ps.provider_id = auth.uid())
  );

-- Authenticated users can insert audit logs
CREATE POLICY "Authenticated users can insert audit logs" ON public.subscription_audit_logs
  FOR INSERT TO authenticated
  WITH CHECK (true);

-- Create payment_receipts storage bucket
INSERT INTO storage.buckets (id, name, public) VALUES ('payment_receipts', 'payment_receipts', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for payment_receipts
CREATE POLICY "Providers can upload receipts" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'payment_receipts' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Providers can view own receipts" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'payment_receipts' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Admins can view all receipts" ON storage.objects
  FOR SELECT TO authenticated
  USING (
    bucket_id = 'payment_receipts' AND
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );
