ALTER TABLE public.users ADD COLUMN IF NOT EXISTS provider_token TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS provider_refresh_token TEXT;
