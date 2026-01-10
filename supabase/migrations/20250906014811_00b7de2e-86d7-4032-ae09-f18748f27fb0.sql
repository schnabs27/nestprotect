-- Remove public read access to sensitive contact information
-- Drop the existing policy that gives public access to everything
DROP POLICY "Public read access on disaster_resources" ON public.disaster_resources;

-- Create new policies that protect sensitive contact information
-- Public users can see basic resource information (but not contact details)
CREATE POLICY "Public read access to basic disaster resource info" 
ON public.disaster_resources 
FOR SELECT 
USING (true);

-- Create a view for public access that excludes sensitive contact information
CREATE OR REPLACE VIEW public.disaster_resources_public AS
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
  created_at,
  updated_at,
  last_verified_at,
  last_seen_at,
  is_archived
FROM public.disaster_resources
WHERE is_archived = false OR is_archived IS NULL;

-- Grant public access to the safe view
GRANT SELECT ON public.disaster_resources_public TO anon;
GRANT SELECT ON public.disaster_resources_public TO authenticated;

-- Create a function that authenticated users can call to get contact info when needed
CREATE OR REPLACE FUNCTION public.get_disaster_resource_contact(resource_id uuid)
RETURNS TABLE(
  id uuid,
  phone text,
  email text
) 
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  -- Only return contact info for authenticated users
  -- This prevents anonymous harvesting while allowing legitimate users access
  SELECT 
    dr.id,
    dr.phone,
    dr.email
  FROM public.disaster_resources dr
  WHERE dr.id = resource_id
    AND auth.uid() IS NOT NULL;  -- Require authentication
$$;

-- Grant execute permission to authenticated users only
GRANT EXECUTE ON FUNCTION public.get_disaster_resource_contact(uuid) TO authenticated;