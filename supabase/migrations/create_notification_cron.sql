-- Enable pg_cron extension if not already enabled
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Create a cron job that runs daily at 9 AM UTC
-- This will call the hyper-handler Edge Function
SELECT cron.schedule(
  'send-expiry-notifications-daily', -- Job name
  '0 9 * * *',                       -- Cron schedule: 9 AM UTC daily
  $$
  SELECT
    net.http_post(
      url := 'https://fonwcqxjwuubnuaavgyr.supabase.co/functions/v1/hyper-handler',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key')
      ),
      body := '{}'::jsonb
    ) as request_id;
  $$
);

-- View all scheduled cron jobs
SELECT * FROM cron.job;
