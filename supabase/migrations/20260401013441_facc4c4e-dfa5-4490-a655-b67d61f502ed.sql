
-- Activity logs table
CREATE TABLE public.activity_logs (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  action text NOT NULL,
  entity_type text,
  entity_id text,
  details jsonb DEFAULT '{}'::jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view all activity logs" ON public.activity_logs
  FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'::app_role));

CREATE POLICY "Users can insert own activity logs" ON public.activity_logs
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Add stripe_price_id to subscription_plans
ALTER TABLE public.subscription_plans ADD COLUMN IF NOT EXISTS stripe_price_id text;
ALTER TABLE public.subscription_plans ADD COLUMN IF NOT EXISTS stripe_product_id text;

-- Add stripe fields to provider_subscriptions
ALTER TABLE public.provider_subscriptions ADD COLUMN IF NOT EXISTS stripe_customer_id text;
ALTER TABLE public.provider_subscriptions ADD COLUMN IF NOT EXISTS stripe_subscription_id text;
ALTER TABLE public.provider_subscriptions ADD COLUMN IF NOT EXISTS current_period_start timestamp with time zone;
ALTER TABLE public.provider_subscriptions ADD COLUMN IF NOT EXISTS current_period_end timestamp with time zone;

-- Admin can view all provider subscriptions
CREATE POLICY "Admins can view all subscriptions" ON public.provider_subscriptions
  FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'::app_role));

-- Admin can update provider subscriptions
CREATE POLICY "Admins can update subscriptions" ON public.provider_subscriptions
  FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'::app_role));

-- Admin can update opportunities (for admin creating opportunities)
CREATE POLICY "Admins can insert opportunities" ON public.opportunities
  FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'::app_role));

CREATE POLICY "Admins can update opportunities" ON public.opportunities
  FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'::app_role));
