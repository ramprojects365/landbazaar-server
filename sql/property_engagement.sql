-- Run after properties and users exist. TypeORM synchronize also creates these in development.
CREATE TABLE IF NOT EXISTS property_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  viewer_id UUID REFERENCES users(id) ON DELETE SET NULL,
  visitor_key VARCHAR(128),
  view_date DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_property_views_property_viewer_day
  ON property_views(property_id, viewer_id, view_date);
CREATE UNIQUE INDEX IF NOT EXISTS idx_property_views_property_visitor_day
  ON property_views(property_id, visitor_key, view_date);
CREATE INDEX IF NOT EXISTS idx_property_views_property_created_at
  ON property_views(property_id, created_at DESC);

CREATE TABLE IF NOT EXISTS property_favourites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
  CONSTRAINT uq_property_favourites_user_property UNIQUE(user_id, property_id)
);

CREATE INDEX IF NOT EXISTS idx_property_favourites_property_id
  ON property_favourites(property_id);