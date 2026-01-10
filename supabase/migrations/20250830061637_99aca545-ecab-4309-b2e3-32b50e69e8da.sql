-- Fix the user_resource_prefs table to use text instead of uuid for resource_id
-- since we're using composite keys like "source_id-source"
ALTER TABLE user_resource_prefs ALTER COLUMN resource_id TYPE TEXT;