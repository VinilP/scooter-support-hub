-- Create scooter products table
CREATE TABLE public.scooter_products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  image_url TEXT NOT NULL,
  range_km INTEGER NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.scooter_products ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access to active products
CREATE POLICY "Anyone can view active scooter products"
ON public.scooter_products
FOR SELECT
USING (is_active = true);

-- Create policy for authenticated users to manage products
CREATE POLICY "Authenticated users can manage scooter products"
ON public.scooter_products
FOR ALL
USING (auth.uid() IS NOT NULL);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_scooter_products_updated_at
BEFORE UPDATE ON public.scooter_products
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample scooter products
INSERT INTO public.scooter_products (name, image_url, range_km, price, description) VALUES
('Thunder X1', 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&h=400&fit=crop', 45, 899.99, 'High-performance electric scooter with advanced features'),
('Urban Glide Pro', 'https://images.unsplash.com/photo-1571068316344-75bc76f77890?w=600&h=400&fit=crop', 35, 649.99, 'Perfect for city commuting with sleek design'),
('Speed Demon', 'https://images.unsplash.com/photo-1544191696-15693072e1d4?w=600&h=400&fit=crop', 60, 1299.99, 'Maximum speed and range for adventure seekers'),
('Eco Rider', 'https://images.unsplash.com/photo-1571068316344-75bc76f77890?w=600&h=400&fit=crop', 25, 449.99, 'Affordable and eco-friendly option'),
('City Cruiser', 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=600&h=400&fit=crop', 40, 749.99, 'Comfortable ride for daily commutes'),
('Storm Rider Pro', 'https://images.unsplash.com/photo-1544191696-15693072e1d4?w=600&h=400&fit=crop', 55, 1099.99, 'All-weather performance scooter');