-- Drop the foreign key constraint first
ALTER TABLE user_resource_prefs DROP CONSTRAINT IF EXISTS user_resource_prefs_resource_id_fkey;

-- Change resource_id column type to TEXT
ALTER TABLE user_resource_prefs ALTER COLUMN resource_id TYPE TEXT;

-- The resource_id will now store composite keys like "source_id-source_name"
-- No foreign key needed since we're referencing external API data