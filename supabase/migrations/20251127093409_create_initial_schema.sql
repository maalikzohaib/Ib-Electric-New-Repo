/*
  # Create Initial Database Schema for Ijaz Brother Electric Store

  ## Overview
  Creates the complete database schema for an e-commerce electrical store with products, categories, pages, and analytics.

  ## New Tables
  
  ### 1. categories
  - `id` (uuid, primary key) - Unique identifier for each category
  - `name` (text) - Category name
  - `slug` (text, unique) - URL-friendly category identifier
  - `description` (text, nullable) - Category description
  - `created_at` (timestamptz) - Creation timestamp
  
  ### 2. products
  - `id` (uuid, primary key) - Unique identifier for each product
  - `name` (text) - Product name
  - `description` (text, nullable) - Product description
  - `price` (numeric) - Product price
  - `category_id` (uuid, foreign key) - References categories table
  - `image_url` (text, nullable) - Primary product image URL
  - `images` (jsonb) - Array of additional product images
  - `is_featured` (boolean) - Whether product is featured on homepage
  - `stock_quantity` (integer) - Available stock count
  - `sku` (text, nullable) - Stock keeping unit
  - `specifications` (jsonb, nullable) - Product specifications as JSON
  - `created_at` (timestamptz) - Creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp
  
  ### 3. pages
  - `id` (uuid, primary key) - Unique identifier for each page
  - `title` (text) - Page title
  - `slug` (text, unique) - URL-friendly page identifier
  - `parent_id` (uuid, nullable, foreign key) - References pages table for nested pages
  - `order_index` (integer) - Display order
  - `is_visible` (boolean) - Whether page is visible in navigation
  - `created_at` (timestamptz) - Creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp
  
  ### 4. page_products
  - `id` (uuid, primary key) - Unique identifier
  - `page_id` (uuid, foreign key) - References pages table
  - `product_id` (uuid, foreign key) - References products table
  - `order_index` (integer) - Display order of product on page
  - `created_at` (timestamptz) - Creation timestamp
  
  ### 5. analytics
  - `id` (uuid, primary key) - Unique identifier
  - `product_id` (uuid, foreign key, nullable) - References products table
  - `event_type` (text) - Type of event (view, cart_add, purchase, etc.)
  - `event_data` (jsonb, nullable) - Additional event data
  - `created_at` (timestamptz) - Event timestamp
  
  ## Security
  - Enable RLS on all tables
  - Add policies for public read access on products, categories, and pages
  - Add policies for authenticated admin access on all tables
  - Analytics table allows public inserts for tracking
  
  ## Indexes
  - Add indexes on foreign keys for better query performance
  - Add indexes on slug fields for faster lookups
  - Add index on product is_featured for homepage queries
*/

-- Create categories table
CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  description text,
  created_at timestamptz DEFAULT now()
);

-- Create products table
CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  price numeric(10,2) NOT NULL DEFAULT 0,
  category_id uuid REFERENCES categories(id) ON DELETE SET NULL,
  image_url text,
  images jsonb DEFAULT '[]'::jsonb,
  is_featured boolean DEFAULT false,
  stock_quantity integer DEFAULT 0,
  sku text,
  specifications jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create pages table
CREATE TABLE IF NOT EXISTS pages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text UNIQUE NOT NULL,
  parent_id uuid REFERENCES pages(id) ON DELETE CASCADE,
  order_index integer DEFAULT 0,
  is_visible boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create page_products junction table
CREATE TABLE IF NOT EXISTS page_products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  page_id uuid REFERENCES pages(id) ON DELETE CASCADE,
  product_id uuid REFERENCES products(id) ON DELETE CASCADE,
  order_index integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  UNIQUE(page_id, product_id)
);

-- Create analytics table
CREATE TABLE IF NOT EXISTS analytics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid REFERENCES products(id) ON DELETE SET NULL,
  event_type text NOT NULL,
  event_data jsonb,
  created_at timestamptz DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_products_category_id ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_is_featured ON products(is_featured);
CREATE INDEX IF NOT EXISTS idx_products_slug ON products(sku);
CREATE INDEX IF NOT EXISTS idx_pages_parent_id ON pages(parent_id);
CREATE INDEX IF NOT EXISTS idx_pages_slug ON pages(slug);
CREATE INDEX IF NOT EXISTS idx_page_products_page_id ON page_products(page_id);
CREATE INDEX IF NOT EXISTS idx_page_products_product_id ON page_products(product_id);
CREATE INDEX IF NOT EXISTS idx_analytics_product_id ON analytics(product_id);
CREATE INDEX IF NOT EXISTS idx_analytics_event_type ON analytics(event_type);
CREATE INDEX IF NOT EXISTS idx_analytics_created_at ON analytics(created_at);

-- Enable Row Level Security
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE page_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics ENABLE ROW LEVEL SECURITY;

-- Categories policies (public read, admin write)
CREATE POLICY "Anyone can view categories"
  ON categories FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Service role can insert categories"
  ON categories FOR INSERT
  TO service_role
  WITH CHECK (true);

CREATE POLICY "Service role can update categories"
  ON categories FOR UPDATE
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Service role can delete categories"
  ON categories FOR DELETE
  TO service_role
  USING (true);

-- Products policies (public read, admin write)
CREATE POLICY "Anyone can view products"
  ON products FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Service role can insert products"
  ON products FOR INSERT
  TO service_role
  WITH CHECK (true);

CREATE POLICY "Service role can update products"
  ON products FOR UPDATE
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Service role can delete products"
  ON products FOR DELETE
  TO service_role
  USING (true);

-- Pages policies (public read, admin write)
CREATE POLICY "Anyone can view visible pages"
  ON pages FOR SELECT
  TO public
  USING (is_visible = true);

CREATE POLICY "Service role can view all pages"
  ON pages FOR SELECT
  TO service_role
  USING (true);

CREATE POLICY "Service role can insert pages"
  ON pages FOR INSERT
  TO service_role
  WITH CHECK (true);

CREATE POLICY "Service role can update pages"
  ON pages FOR UPDATE
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Service role can delete pages"
  ON pages FOR DELETE
  TO service_role
  USING (true);

-- Page products policies
CREATE POLICY "Anyone can view page products"
  ON page_products FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Service role can insert page products"
  ON page_products FOR INSERT
  TO service_role
  WITH CHECK (true);

CREATE POLICY "Service role can update page products"
  ON page_products FOR UPDATE
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Service role can delete page products"
  ON page_products FOR DELETE
  TO service_role
  USING (true);

-- Analytics policies (public insert for tracking, admin read)
CREATE POLICY "Anyone can insert analytics"
  ON analytics FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Service role can view analytics"
  ON analytics FOR SELECT
  TO service_role
  USING (true);

CREATE POLICY "Service role can delete analytics"
  ON analytics FOR DELETE
  TO service_role
  USING (true);