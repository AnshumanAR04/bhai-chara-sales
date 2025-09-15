-- Seed data for the CRM system

-- Insert sample farmers
INSERT INTO farmers (name, phone, village, district, crop_type, acreage) VALUES
('Rajesh Kumar', '+91-9876543210', 'Kharkhoda', 'Sonipat', 'Wheat', 5.5),
('Priya Sharma', '+91-9876543211', 'Gohana', 'Sonipat', 'Rice', 3.2),
('Amit Singh', '+91-9876543212', 'Panipat', 'Panipat', 'Cotton', 8.0),
('Sunita Devi', '+91-9876543213', 'Karnal', 'Karnal', 'Sugarcane', 4.5),
('Vikram Yadav', '+91-9876543214', 'Kurukshetra', 'Kurukshetra', 'Mustard', 6.0),
('Meera Patel', '+91-9876543215', 'Ambala', 'Ambala', 'Wheat', 7.2),
('Ravi Gupta', '+91-9876543216', 'Yamunanagar', 'Yamunanagar', 'Rice', 2.8),
('Kavita Jain', '+91-9876543217', 'Hisar', 'Hisar', 'Cotton', 9.5)
ON CONFLICT (phone) DO NOTHING;

-- Insert sample products
INSERT INTO products (name, category, description, price) VALUES
('NPK Fertilizer 20-20-20', 'Fertilizer', 'Balanced NPK fertilizer for all crops', 850.00),
('Urea 46%', 'Fertilizer', 'High nitrogen content fertilizer', 650.00),
('Chlorpyrifos 20% EC', 'Pesticide', 'Broad spectrum insecticide', 420.00),
('2,4-D Amine Salt', 'Herbicide', 'Selective herbicide for wheat', 180.00),
('Mancozeb 75% WP', 'Fungicide', 'Protective fungicide for various crops', 320.00),
('DAP (Di-Ammonium Phosphate)', 'Fertilizer', 'Phosphorus rich fertilizer', 1200.00),
('Imidacloprid 17.8% SL', 'Pesticide', 'Systemic insecticide', 380.00),
('Glyphosate 41% SL', 'Herbicide', 'Non-selective herbicide', 450.00)
ON CONFLICT DO NOTHING;

-- Insert sample leads
INSERT INTO leads (farmer_id, status, notes) VALUES
(1, 'contacted', 'Initial contact made, interested in wheat fertilizers'),
(2, 'interested', 'Showed interest in rice pesticides, follow up needed'),
(3, 'negotiation', 'Discussing bulk pricing for cotton products'),
(4, 'qualified', 'Ready to purchase sugarcane fertilizers'),
(1, 'new', 'New inquiry about organic pesticides'),
(5, 'contacted', 'Contacted about mustard crop protection'),
(6, 'interested', 'Interested in wheat herbicides'),
(7, 'lost', 'Decided to go with competitor'),
(8, 'won', 'Purchased cotton pesticides successfully')
ON CONFLICT DO NOTHING;

-- Insert sample purchases
INSERT INTO purchases (farmer_id, product_id, quantity, purchase_date) VALUES
(1, 1, 10.0, '2024-01-15'),
(3, 3, 5.0, '2024-01-20'),
(4, 6, 8.0, '2024-02-01'),
(8, 3, 12.0, '2024-02-10'),
(1, 4, 3.0, '2024-02-15'),
(6, 1, 6.0, '2024-02-20')
ON CONFLICT DO NOTHING;

-- Insert sample recommended products
INSERT INTO recommended_products (farmer_id, product_id) VALUES
(2, 5), -- Rice farmer - fungicide
(5, 4), -- Mustard farmer - herbicide
(7, 1), -- Rice farmer - NPK fertilizer
(2, 3), -- Rice farmer - insecticide
(5, 1), -- Mustard farmer - NPK fertilizer
(6, 4)  -- Wheat farmer - herbicide
ON CONFLICT DO NOTHING;
