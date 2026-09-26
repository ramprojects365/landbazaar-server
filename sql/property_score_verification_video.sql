-- Migration for Dekho Land Score, Verification Workflow, and Video uploads
ALTER TABLE properties
  ADD COLUMN IF NOT EXISTS verified BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS verification_status VARCHAR(20) DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS verified_at TIMESTAMP WITH TIME ZONE NULL,
  ADD COLUMN IF NOT EXISTS verified_by UUID NULL REFERENCES users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS dekho_land_score INTEGER NULL,
  ADD COLUMN IF NOT EXISTS dekho_land_score_details JSONB NULL,
  ADD COLUMN IF NOT EXISTS videos JSONB NULL;

CREATE INDEX IF NOT EXISTS idx_properties_verified ON properties(verified);
CREATE INDEX IF NOT EXISTS idx_properties_verification_status ON properties(verification_status);
CREATE INDEX IF NOT EXISTS idx_properties_dekho_land_score ON properties(dekho_land_score);
