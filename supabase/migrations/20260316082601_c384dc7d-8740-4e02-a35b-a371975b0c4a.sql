
-- Add category column (mirrors type initially)
ALTER TABLE public.opportunities ADD COLUMN IF NOT EXISTS category text NOT NULL DEFAULT 'job';

-- Copy existing type values into category
UPDATE public.opportunities SET category = type WHERE category = 'job' AND type != 'job';

-- Add tags column
ALTER TABLE public.opportunities ADD COLUMN IF NOT EXISTS tags text[] DEFAULT '{}';
