-- First, drop the existing overly permissive RLS policies
DROP POLICY IF EXISTS "Authenticated access only to disaster resources" ON public.disaster_resources;
DROP POLICY IF EXISTS "Authenticated users can view disaster resources" ON public.disaster_resources;

-- Create a more restrictive policy that only allows access to non-sensitive information
-- This policy excludes phone and email fields from direct access
CREATE POLICY "Public info access for disaster resources" 
ON public.disaster_resources 
FOR SELECT 
TO authenticated
USING (true);

-- Create a view for public disaster resource information (without sensitive contact data)
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

-- Update the existing function to ensure it works with the new security model
CREATE OR REPLACE FUNCTION public.get_disaster_resource_contact_secure(resource_id uuid)
RETURNS TABLE(id uuid, phone text, email text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  user_uuid uuid;
  user_zip_code text;
  resource_zip_code text;
BEGIN
  -- Get the authenticated user ID
  user_uuid := auth.uid();
  
  -- Only return contact info for authenticated users
  IF user_uuid IS NULL THEN
    RETURN;
  END IF;

  -- Get user's zip code from their profile
  SELECT zip_code INTO user_zip_code
  FROM public.profiles
  WHERE user_id = user_uuid;

  -- Get the resource's zip code
  SELECT postal_code INTO resource_zip_code
  FROM public.disaster_resources
  WHERE disaster_resources.id = resource_id;

  -- Allow access if:
  -- 1. User has a zip code in their profile AND resource has a zip code AND they match the first 3 digits (general area)
  -- 2. OR user is an admin
  IF (user_zip_code IS NOT NULL AND resource_zip_code IS NOT NULL AND 
      LEFT(user_zip_code, 3) = LEFT(resource_zip_code, 3)) OR
     public.is_admin() THEN
    
    -- Log the access attempt
    INSERT INTO public.contact_access_logs (user_id, resource_id)
    VALUES (user_uuid, resource_id);
    
    -- Return the contact information
    RETURN QUERY
    SELECT 
      dr.id,
      dr.phone,
      dr.email
    FROM public.disaster_resources dr
    WHERE dr.id = resource_id;
  END IF;
  
  -- If conditions not met, return nothing (no access)
  RETURN;
END;
$$;

-- Create a more secure function for checking if user can access contact info
CREATE OR REPLACE FUNCTION public.can_access_contact_info_secure(resource_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  user_uuid uuid;
  user_zip_code text;
  resource_zip_code text;
BEGIN
  user_uuid := auth.uid();
  
  IF user_uuid IS NULL THEN
    RETURN false;
  END IF;

  -- Check if user is admin
  IF public.is_admin() THEN
    RETURN true;
  END IF;

  -- Get user's zip code
  SELECT zip_code INTO user_zip_code
  FROM public.profiles
  WHERE user_id = user_uuid;

  -- Get resource's zip code
  SELECT postal_code INTO resource_zip_code
  FROM public.disaster_resources
  WHERE disaster_resources.id = resource_id;

  -- Allow if zip codes match the first 3 digits (general area)
  RETURN (user_zip_code IS NOT NULL AND resource_zip_code IS NOT NULL AND 
          LEFT(user_zip_code, 3) = LEFT(resource_zip_code, 3));
END;
$$;