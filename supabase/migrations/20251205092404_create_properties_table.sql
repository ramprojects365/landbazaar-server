/*
  # Create comprehensive properties table for real estate listings

  ## Overview
  Complete property listing management system with all amenities, facilities, and security features.

  ## 1. New Tables
    - `properties` - Main property listing table with comprehensive details

  ## 2. Basic Information Fields
    - `id` (uuid, primary key) - Unique property identifier
    - `title` (varchar 255, required) - Property listing title
    - `description` (text, required) - Detailed property description
    - `listing_type` (varchar 20, required) - Type: 'rent' or 'sale'
    - `property_type` (varchar 50, required) - Type: Apartment, House, Condo, etc.
    - `tenure` (varchar 50, required) - Ownership: 'freehold' or 'leasehold'

  ## 3. Location Details
    - `property_name` (varchar 255) - Name of the property/building
    - `street_name` (varchar 255) - Street address
    - `city_name` (varchar 100) - City name
    - `state` (varchar 100) - State/Province
    - `county` (varchar 100) - County
    - `pincode` (varchar 20) - ZIP/Postal code
    - `landmark` (varchar 255) - Nearby landmark for easy identification

  ## 4. Property Details
    - `price` (numeric, required) - Property price or monthly rental amount
    - `buildup_area` (numeric) - Total area in square feet
    - `furnishing` (varchar 20) - Furnishing status: Fully, Partially, Unfurnished
    - `bedrooms` (integer) - Number of bedrooms
    - `bathrooms` (integer) - Number of bathrooms
    - `availability` (varchar 50) - Availability: Immediate, Next month, Under Construction
    - `floor_level` (varchar 50) - Floor number/level
    - `year_of_build` (integer) - Year the property was constructed
    - `negotiable` (boolean, default false) - Whether price is negotiable

  ## 5. Amenities (boolean fields, default false)
    - `swimming_pool` - Swimming pool facility
    - `gymnasium` - Gym/fitness center
    - `playground` - Children's play area
    - `bbq_area` - BBQ/grilling area
    - `function_room` - Function/party room
    - `games_room` - Games/recreation room
    - `sky_garden` - Sky garden/rooftop garden
    - `reading_room` - Reading room/library
    - `lounge` - Lounge area

  ## 6. Facilities (boolean fields, default false)
    - `covered_parking` - Covered parking spaces
    - `visitor_parking` - Visitor parking availability
    - `service_lift` - Service elevator
    - `prayer_room` - Surau/Prayer room
    - `parcel_locker` - Parcel locker system
    - `laundry_room` - Laundry facilities
    - `cafeteria` - Cafeteria/food court

  ## 7. Security & Safety Features (boolean fields, default false)
    - `security_24h` - 24-hour security personnel
    - `cctv_surveillance` - CCTV camera surveillance
    - `access_card_system` - Access card entry system
    - `fire_alarm_system` - Fire alarm and detection system
    - `emergency_exit` - Clearly marked emergency exits

  ## 8. Media
    - `images` (jsonb) - Array of image URLs from DigitalOcean Spaces (max 10 images)

  ## 9. System Fields
    - `status` (varchar 50, default 'active') - Listing status: active, inactive, sold, rented
    - `user_id` (uuid, required) - Reference to property owner/creator
    - `created_at` (timestamptz) - Record creation timestamp
    - `updated_at` (timestamptz) - Last update timestamp

  ## 10. Security Policies
    - Enable RLS on properties table
    - Authenticated users can view all active properties
    - Users can only view their own inactive/draft properties
    - Users can create properties (linked to their user_id)
    - Users can update only their own properties
    - Users can delete only their own properties

  ## 11. Performance Indexes
    - Index on user_id for owner-specific queries
    - Index on listing_type for filtering rent vs sale
    - Index on city_name for location-based searches
    - Index on price for price range queries
    - Index on status for filtering active listings
    - Composite index on (listing_type, city_name, status) for common queries

  ## 12. Triggers
    - Auto-update updated_at timestamp on record changes
*/

CREATE TABLE IF NOT EXISTS properties (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  
  title varchar(255) NOT NULL,
  description text NOT NULL,
  listing_type varchar(20) NOT NULL CHECK (listing_type IN ('rent', 'sale')),
  property_type varchar(50) NOT NULL,
  tenure varchar(50) NOT NULL CHECK (tenure IN ('freehold', 'leasehold')),

  property_name varchar(255),
  street_name varchar(255),
  city_name varchar(100),
  state varchar(100),
  county varchar(100),
  pincode varchar(20),
  landmark varchar(255),

  price numeric(15, 2) NOT NULL CHECK (price >= 0),
  buildup_area numeric(10, 2) CHECK (buildup_area >= 0),
  furnishing varchar(20) CHECK (furnishing IN ('Fully', 'Partially', 'Unfurnished')),
  bedrooms integer CHECK (bedrooms >= 0),
  bathrooms integer CHECK (bathrooms >= 0),
  availability varchar(50) CHECK (availability IN ('Immediate', 'Next month', 'Under Construction')),
  floor_level varchar(50),
  year_of_build integer CHECK (year_of_build >= 1800 AND year_of_build <= 2100),
  negotiable boolean DEFAULT false,

  swimming_pool boolean DEFAULT false,
  gymnasium boolean DEFAULT false,
  playground boolean DEFAULT false,
  bbq_area boolean DEFAULT false,
  function_room boolean DEFAULT false,
  games_room boolean DEFAULT false,
  sky_garden boolean DEFAULT false,
  reading_room boolean DEFAULT false,
  lounge boolean DEFAULT false,

  covered_parking boolean DEFAULT false,
  visitor_parking boolean DEFAULT false,
  service_lift boolean DEFAULT false,
  prayer_room boolean DEFAULT false,
  parcel_locker boolean DEFAULT false,
  laundry_room boolean DEFAULT false,
  cafeteria boolean DEFAULT false,

  security_24h boolean DEFAULT false,
  cctv_surveillance boolean DEFAULT false,
  access_card_system boolean DEFAULT false,
  fire_alarm_system boolean DEFAULT false,
  emergency_exit boolean DEFAULT false,

  images jsonb,
  
  status varchar(50) DEFAULT 'active' NOT NULL,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_properties_user_id ON properties(user_id);
CREATE INDEX IF NOT EXISTS idx_properties_listing_type ON properties(listing_type);
CREATE INDEX IF NOT EXISTS idx_properties_city_name ON properties(city_name);
CREATE INDEX IF NOT EXISTS idx_properties_price ON properties(price);
CREATE INDEX IF NOT EXISTS idx_properties_status ON properties(status);
CREATE INDEX IF NOT EXISTS idx_properties_composite ON properties(listing_type, city_name, status);

ALTER TABLE properties ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view active properties"
  ON properties FOR SELECT
  TO authenticated
  USING (status = 'active' OR auth.uid() = user_id);

CREATE POLICY "Users can create their own properties"
  ON properties FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own properties"
  ON properties FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own properties"
  ON properties FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'set_properties_updated_at'
  ) THEN
    CREATE TRIGGER set_properties_updated_at
      BEFORE UPDATE ON properties
      FOR EACH ROW
      EXECUTE FUNCTION handle_updated_at();
  END IF;
END $$;
