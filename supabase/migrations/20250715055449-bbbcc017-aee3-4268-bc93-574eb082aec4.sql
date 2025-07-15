-- Update existing scooter products to use moped/Vespa style scooters
UPDATE public.scooter_products SET 
  name = 'Vespa Elettrica',
  image_url = 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=600&h=400&fit=crop',
  range_km = 100,
  price = 6390.00,
  description = 'Classic Italian design meets modern electric technology'
WHERE name = 'Thunder X1';

UPDATE public.scooter_products SET 
  name = 'Urban Classic 125',
  image_url = 'https://images.unsplash.com/photo-1571068316344-75bc76f77890?w=600&h=400&fit=crop',
  range_km = 85,
  price = 4999.00,
  description = 'Retro-styled electric moped perfect for city commuting'
WHERE name = 'Urban Glide Pro';

UPDATE public.scooter_products SET 
  name = 'Lightning Sport',
  image_url = 'https://images.unsplash.com/photo-1544191696-15693072e1d4?w=600&h=400&fit=crop',
  range_km = 120,
  price = 7890.00,
  description = 'High-performance electric moped with sport styling'
WHERE name = 'Speed Demon';

UPDATE public.scooter_products SET 
  name = 'Metro Cruiser',
  image_url = 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&h=400&fit=crop',
  range_km = 75,
  price = 3999.00,
  description = 'Affordable electric moped with modern features'
WHERE name = 'Eco Rider';

UPDATE public.scooter_products SET 
  name = 'Classic Retro 150',
  image_url = 'https://images.unsplash.com/photo-1571068316344-75bc76f77890?w=600&h=400&fit=crop',
  range_km = 90,
  price = 5499.00,
  description = 'Vintage-inspired electric moped with premium comfort'
WHERE name = 'City Cruiser';

UPDATE public.scooter_products SET 
  name = 'Storm Elite Pro',
  image_url = 'https://images.unsplash.com/photo-1544191696-15693072e1d4?w=600&h=400&fit=crop',
  range_km = 110,
  price = 6999.00,
  description = 'Premium electric moped with advanced connectivity'
WHERE name = 'Storm Rider Pro';