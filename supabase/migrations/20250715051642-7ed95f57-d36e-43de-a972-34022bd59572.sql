-- Add tags column to faqs table
ALTER TABLE public.faqs ADD COLUMN tags TEXT[] DEFAULT '{}';

-- Update existing FAQs with relevant tags
UPDATE public.faqs SET tags = CASE 
  WHEN category = 'charging' THEN ARRAY['charging', 'battery', 'power']
  WHEN category = 'performance' THEN ARRAY['speed', 'range', 'performance']
  WHEN category = 'maintenance' THEN ARRAY['maintenance', 'care', 'waterproof']
  ELSE ARRAY['general', 'help']
END;

-- Create index for better tag search performance
CREATE INDEX idx_faqs_tags ON public.faqs USING GIN(tags);