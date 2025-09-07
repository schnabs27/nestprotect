-- Drop the problematic view with SECURITY DEFINER
DROP VIEW IF EXISTS public.disaster_resources_public;

-- Create a simple view without SECURITY DEFINER (this will use the caller's permissions)
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

-- Grant necessary permissions
GRANT SELECT ON public.disaster_resources_public TO authenticated;
GRANT SELECT ON public.disaster_resources_public TO anon;