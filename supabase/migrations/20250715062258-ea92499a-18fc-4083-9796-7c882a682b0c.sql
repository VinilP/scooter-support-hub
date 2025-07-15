-- Update scooter_products with new Unsplash image URLs
UPDATE scooter_products 
SET image_url = CASE 
  WHEN name = 'EcoRide Pro' THEN 'https://images.unsplash.com/photo-1557002666-fb0b642114f6?q=80&w=987&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
  WHEN name = 'CityCommuter' THEN 'https://images.unsplash.com/photo-1713756416668-e427df68e166?q=80&w=987&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
  WHEN name = 'SpeedDemon' THEN 'https://images.unsplash.com/photo-1538895490524-0ded232a96d8?q=80&w=1530&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
  ELSE image_url
END
WHERE name IN ('EcoRide Pro', 'CityCommuter', 'SpeedDemon');