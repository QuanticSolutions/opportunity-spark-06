
-- Insert footer_settings site_page if not exists (default JSON content)
INSERT INTO public.site_pages (slug, title, content)
VALUES (
  'footer_settings',
  'Footer Settings',
  '{"email":"somopportunity@gmail.com","location":"Hargeisa, Somaliland","copyright":"© {year} SomOpportunity. All rights reserved.","privacy_url":"/privacy","terms_url":"/terms","cookie_url":"/privacy"}'
)
ON CONFLICT (slug) DO NOTHING;

-- Function to mark subscriptions as expired and notify providers
CREATE OR REPLACE FUNCTION public.process_subscription_expiry()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  sub_record RECORD;
BEGIN
  -- 1) Notify providers whose subscription expires within 3 days (only once per cycle)
  FOR sub_record IN
    SELECT ps.id, ps.provider_id, ps.current_period_end
    FROM provider_subscriptions ps
    WHERE ps.status = 'active'
      AND ps.current_period_end IS NOT NULL
      AND ps.current_period_end > now()
      AND ps.current_period_end <= now() + interval '3 days'
      AND NOT EXISTS (
        SELECT 1 FROM notifications n
        WHERE n.user_id = ps.provider_id
          AND n.title = 'Subscription Expiring Soon'
          AND n.created_at > now() - interval '3 days'
      )
  LOOP
    INSERT INTO notifications (user_id, title, message)
    VALUES (
      sub_record.provider_id,
      'Subscription Expiring Soon',
      'Your subscription will expire on ' || to_char(sub_record.current_period_end, 'Mon DD, YYYY') ||
      '. Please renew to continue posting opportunities. If you need assistance, please contact us.'
    );
  END LOOP;

  -- 2) Mark expired subscriptions and notify
  FOR sub_record IN
    SELECT ps.id, ps.provider_id
    FROM provider_subscriptions ps
    WHERE ps.status = 'active'
      AND ps.current_period_end IS NOT NULL
      AND ps.current_period_end <= now()
  LOOP
    UPDATE provider_subscriptions
    SET status = 'expired', updated_at = now()
    WHERE id = sub_record.id;

    INSERT INTO notifications (user_id, title, message)
    VALUES (
      sub_record.provider_id,
      'Subscription Expired',
      'Your subscription has expired. You cannot post new opportunities or articles until you renew. If you need assistance, please contact us.'
    );
  END LOOP;
END;
$$;

-- Enable extensions for cron job
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Schedule the function to run daily at 9 AM UTC
SELECT cron.unschedule('process-subscription-expiry')
WHERE EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'process-subscription-expiry');

SELECT cron.schedule(
  'process-subscription-expiry',
  '0 9 * * *',
  $$ SELECT public.process_subscription_expiry(); $$
);
