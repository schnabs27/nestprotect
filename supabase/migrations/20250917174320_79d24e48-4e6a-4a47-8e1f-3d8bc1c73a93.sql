-- Add missing columns to disaster_resources table
ALTER TABLE public.disaster_resources 
ADD COLUMN IF NOT EXISTS source_id text,
ADD COLUMN IF NOT EXISTS latitude numeric,
ADD COLUMN IF NOT EXISTS longitude numeric,
ADD COLUMN IF NOT EXISTS requested_zipcode text;

-- Create index for better performance on lookups
CREATE INDEX IF NOT EXISTS idx_disaster_resources_source_lookup 
ON public.disaster_resources(source_id, source);

-- Create index for geolocation queries
CREATE INDEX IF NOT EXISTS idx_disaster_resources_location 
ON public.disaster_resources(latitude, longitude);