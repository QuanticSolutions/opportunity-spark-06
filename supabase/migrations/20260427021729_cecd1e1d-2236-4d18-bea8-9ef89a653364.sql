-- Normalize provider_subscriptions.status to only allow: active, pending, expired, cancelled
UPDATE public.provider_subscriptions
SET status = CASE
  WHEN status IN ('active') THEN 'active'
  WHEN status IN ('expired') THEN 'expired'
  WHEN status IN ('cancelled', 'rejected', 'suspended') THEN 'cancelled'
  ELSE 'pending'
END;

-- Set the default to 'pending'
ALTER TABLE public.provider_subscriptions
  ALTER COLUMN status SET DEFAULT 'pending';

-- Enforce allowed values via CHECK constraint
ALTER TABLE public.provider_subscriptions
  DROP CONSTRAINT IF EXISTS provider_subscriptions_status_check;

ALTER TABLE public.provider_subscriptions
  ADD CONSTRAINT provider_subscriptions_status_check
  CHECK (status IN ('active', 'pending', 'expired', 'cancelled'));