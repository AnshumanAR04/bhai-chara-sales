-- PostgreSQL DDL for Farmer Sales App
-- Create tables for the CRM system

-- Farmers Table
CREATE TABLE IF NOT EXISTS farmers (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(50) NOT NULL UNIQUE,
  village VARCHAR(255),
  district VARCHAR(255),
  crop_type VARCHAR(100),
  acreage NUMERIC(10,2),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Products Table
CREATE TABLE IF NOT EXISTS products (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  category VARCHAR(100),
  description TEXT,
  price NUMERIC(10,2),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Leads Table (tracks sales progress)
CREATE TABLE IF NOT EXISTS leads (
  id SERIAL PRIMARY KEY,
  farmer_id INT NOT NULL REFERENCES farmers(id) ON DELETE CASCADE,
  status VARCHAR(50) NOT NULL DEFAULT 'new',
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Purchases Table
CREATE TABLE IF NOT EXISTS purchases (
  id SERIAL PRIMARY KEY,
  farmer_id INT NOT NULL REFERENCES farmers(id) ON DELETE CASCADE,
  product_id INT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  quantity NUMERIC(10,2),
  purchase_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Recommended Products Table (links farmers to recommended products)
CREATE TABLE IF NOT EXISTS recommended_products (
  id SERIAL PRIMARY KEY,
  farmer_id INT NOT NULL REFERENCES farmers(id) ON DELETE CASCADE,
  product_id INT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  recommendation_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_farmers_phone ON farmers(phone);
CREATE INDEX IF NOT EXISTS idx_leads_farmer ON leads(farmer_id);
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
CREATE INDEX IF NOT EXISTS idx_purchases_farmer ON purchases(farmer_id);
CREATE INDEX IF NOT EXISTS idx_recommended_farmer ON recommended_products(farmer_id);
