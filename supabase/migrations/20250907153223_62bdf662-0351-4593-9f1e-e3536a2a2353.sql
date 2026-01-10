-- First, let's see what policies currently exist and drop all of them
DROP POLICY IF EXISTS "Public info access for disaster resources" ON public.disaster_resources;
DROP POLICY IF EXISTS "Authenticated access only to disaster resources" ON public.disaster_resources;
DROP POLICY IF EXISTS "Authenticated users can view disaster resources" ON public.disaster_resources;

-- Now create the more restrictive policy
-- Note: This policy still allows SELECT but the application should use the secure functions
CREATE POLICY "Limited disaster resources access" 
ON public.disaster_resources 
FOR SELECT 
TO authenticated
USING (true);

-- Create a view for public disaster resource information (without sensitive contact data)
DROP VIEW IF EXISTS public.disaster_resources_public;
CREATE VIEW public.disaster_resources_public AS
SELECT 
  id,
  name,
  category,
  description,
  address,
  city,
  state,
  postal_code,
  website,
  hours,
  latitude,
  longitude,
  distance_mi,
  source,
  source_id,
  created_at,
  updated_at,
  last_verified_at,
  last_seen_at,
  is_archived
FROM public.disaster_resources
WHERE (is_archived = false OR is_archived IS NULL);

-- Grant access to the public view
GRANT SELECT ON public.disaster_resources_public TO authenticated;
GRANT SELECT ON public.disaster_resources_public TO anon;