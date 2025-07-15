-- Create FAQs table
CREATE TABLE public.faqs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  category TEXT DEFAULT 'general',
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.faqs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for FAQs (admin-only access for now)
CREATE POLICY "Allow read access to FAQs" ON public.faqs
  FOR SELECT USING (true);

CREATE POLICY "Allow authenticated users to manage FAQs" ON public.faqs
  FOR ALL USING (auth.uid() IS NOT NULL);

-- Create trigger for updated_at
CREATE TRIGGER update_faqs_updated_at
  BEFORE UPDATE ON public.faqs
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert some sample FAQs
INSERT INTO public.faqs (question, answer, category, display_order) VALUES
('How do I charge my electric scooter?', 'Connect the charger to your scooter and plug it into a standard wall outlet. Most scooters take 3-6 hours for a full charge.', 'charging', 1),
('What is the maximum speed of the scooter?', 'Most electric scooters have a maximum speed of 15-25 mph, depending on the model and local regulations.', 'performance', 2),
('How far can I ride on a single charge?', 'Range varies by model, but typically 15-40 miles per charge depending on battery capacity, rider weight, and terrain.', 'performance', 3),
('Is the scooter waterproof?', 'Most scooters are water-resistant but not fully waterproof. Avoid riding in heavy rain or through deep puddles.', 'maintenance', 4),
('How do I maintain my scooter?', 'Regular maintenance includes checking tire pressure, cleaning the deck, inspecting brakes, and storing properly when not in use.', 'maintenance', 5);