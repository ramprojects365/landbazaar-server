-- Remove deprecated floor plan column after API/form deprecation.
ALTER TABLE IF EXISTS properties
DROP COLUMN IF EXISTS floor_plan;