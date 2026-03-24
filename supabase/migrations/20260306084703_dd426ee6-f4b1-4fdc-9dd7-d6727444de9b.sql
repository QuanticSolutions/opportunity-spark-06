
-- Subscription plans reference table
CREATE TABLE public.subscription_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  display_name text NOT NULL,
  posting_limit integer, -- NULL = unlimited
  price_monthly numeric(10,2) NOT NULL DEFAULT 0,
  features jsonb NOT NULL DEFAULT '[]'::jsonb,
  tier integer NOT NULL DEFAULT 1,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view plans"
  ON public.subscription_plans FOR SELECT
  USING (true);

-- Seed the three plans
INSERT INTO public.subscription_plans (name, display_name, posting_limit, price_monthly, tier, features) VALUES
('basic', 'Basic Plan', 4, 0, 1, '["Post up to 4 opportunities","View applicant profiles","Download applicant documents","Direct email communication","Manual admin approval"]'::jsonb),
('professional', 'Professional Plan', 7, 49.99, 2, '["Post 5–7 opportunities","Full applicant management","Candidate status tracking","Advanced filtering","Priority admin approval","Limited team access","Monthly social media promotion"]'::jsonb),
('enterprise', 'Enterprise Plan', null, 149.99, 3, '["Unlimited opportunity postings","Advanced candidate management","Multiple admin users","Custom onboarding support","Optional integrations","Weekly social media promotion"]'::jsonb);

-- Provider subscriptions
CREATE TABLE public.provider_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  plan_id uuid NOT NULL REFERENCES public.subscription_plans(id),
  status text NOT NULL DEFAULT 'pending_approval',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  renewal_date timestamptz,
  UNIQUE(provider_id)
);

ALTER TABLE public.provider_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Providers can view own subscription"
  ON public.provider_subscriptions FOR SELECT
  USING (auth.uid() = provider_id);

CREATE POLICY "Providers can insert own subscription"
  ON public.provider_subscriptions FOR INSERT
  WITH CHECK (auth.uid() = provider_id);

CREATE POLICY "Providers can update own subscription"
  ON public.provider_subscriptions FOR UPDATE
  USING (auth.uid() = provider_id);

-- Opportunity add-ons
CREATE TABLE public.opportunity_addons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  opportunity_id uuid NOT NULL REFERENCES public.opportunities(id) ON DELETE CASCADE,
  addon_type text NOT NULL,
  price numeric(10,2) NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.opportunity_addons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Providers can view own addons"
  ON public.opportunity_addons FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.opportunities o
      WHERE o.id = opportunity_id AND o.provider_id = auth.uid()
    )
  );

CREATE POLICY "Providers can insert own addons"
  ON public.opportunity_addons FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.opportunities o
      WHERE o.id = opportunity_id AND o.provider_id = auth.uid()
    )
  );

-- Messages table for provider-applicant communication
CREATE TABLE public.messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id uuid NOT NULL REFERENCES public.profiles(id),
  recipient_id uuid NOT NULL REFERENCES public.profiles(id),
  application_id uuid REFERENCES public.applications(id) ON DELETE SET NULL,
  subject text NOT NULL,
  body text NOT NULL,
  read boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own messages"
  ON public.messages FOR SELECT
  USING (auth.uid() = sender_id OR auth.uid() = recipient_id);

CREATE POLICY "Users can send messages"
  ON public.messages FOR INSERT
  WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Recipients can update messages"
  ON public.messages FOR UPDATE
  USING (auth.uid() = recipient_id);

-- Add more fields to opportunities
ALTER TABLE public.opportunities
  ADD COLUMN IF NOT EXISTS requirements text,
  ADD COLUMN IF NOT EXISTS deadline timestamptz,
  ADD COLUMN IF NOT EXISTS external_link text,
  ADD COLUMN IF NOT EXISTS allow_internal_apply boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS attachments jsonb DEFAULT '[]'::jsonb;

-- Add more fields to applications
ALTER TABLE public.applications
  ADD COLUMN IF NOT EXISTS cover_letter text,
  ADD COLUMN IF NOT EXISTS documents jsonb DEFAULT '[]'::jsonb;

-- Triggers for updated_at
CREATE TRIGGER set_updated_at_provider_subscriptions
  BEFORE UPDATE ON public.provider_subscriptions
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Allow providers to also view applications on their opportunities
CREATE POLICY "Providers can view applications on their opportunities"
  ON public.applications FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.opportunities o
      WHERE o.id = opportunity_id AND o.provider_id = auth.uid()
    )
  );

-- Allow providers to update application status
CREATE POLICY "Providers can update application status"
  ON public.applications FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.opportunities o
      WHERE o.id = opportunity_id AND o.provider_id = auth.uid()
    )
  );
