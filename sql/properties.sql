CREATE TABLE IF NOT EXISTS properties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  listing_type VARCHAR(20) NOT NULL CHECK (listing_type IN ('rent', 'sale')),
  property_type VARCHAR(50) NOT NULL,
  tenure VARCHAR(50) NOT NULL CHECK (tenure IN ('freehold', 'leasehold')),

  property_name VARCHAR(255),
  street_name VARCHAR(255),
  city_name VARCHAR(100),
  state VARCHAR(100),
  county VARCHAR(100),
  pincode VARCHAR(20),
  landmark VARCHAR(255),
  location TEXT,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,

  price NUMERIC(15, 2) NOT NULL CHECK (price >= 0),
  buildup_area NUMERIC(10, 2) CHECK (buildup_area >= 0),
  furnishing VARCHAR(20) CHECK (furnishing IN ('Fully', 'Partially', 'Unfurnished')),
  bedrooms INTEGER CHECK (bedrooms >= 0),
  bathrooms INTEGER CHECK (bathrooms >= 0),
  availability VARCHAR(50) CHECK (availability IN ('Immediate', 'Next month', 'Under Construction')),
  floor_level VARCHAR(50),
  year_of_build INTEGER CHECK (year_of_build >= 1800 AND year_of_build <= 2100),
  negotiable BOOLEAN DEFAULT false,

  amenities JSONB DEFAULT '{
    "lifestyle": [],
    "facilities": [],
    "security": []
  }'::jsonb,

  images JSONB,

  status VARCHAR(50) DEFAULT 'active' NOT NULL,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_properties_user_id ON properties(user_id);
CREATE INDEX IF NOT EXISTS idx_properties_listing_type ON properties(listing_type);
CREATE INDEX IF NOT EXISTS idx_properties_city_name ON properties(city_name);
CREATE INDEX IF NOT EXISTS idx_properties_price ON properties(price);
CREATE INDEX IF NOT EXISTS idx_properties_status ON properties(status);
CREATE INDEX IF NOT EXISTS idx_properties_composite ON properties(listing_type, city_name, status);

CREATE OR REPLACE FUNCTION update_properties_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_properties_updated_at ON properties;
CREATE TRIGGER set_properties_updated_at
  BEFORE UPDATE ON properties
  FOR EACH ROW
  EXECUTE FUNCTION update_properties_updated_at();
