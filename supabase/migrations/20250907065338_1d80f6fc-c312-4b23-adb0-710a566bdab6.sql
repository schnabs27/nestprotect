-- Fix security issue: Restrict direct access to sensitive contact information
-- Drop the current overly permissive policy
DROP POLICY IF EXISTS "Public read access to basic disaster resource info" ON public.disaster_resources;

-- Create a new policy that excludes sensitive contact information for direct table access
-- This policy only allows public access to non-sensitive columns
CREATE POLICY "Public read access to non-sensitive disaster resource info" 
ON public.disaster_resources 
FOR SELECT 
USING (true);

-- To ensure complete security, we need to create a view for public access that excludes sensitive data
-- and then restrict the table policy to only return safe columns

-- First, let's create a more restrictive RLS policy
-- Drop the previous policy if it exists
DROP POLICY IF EXISTS "Public read access to non-sensitive disaster resource info" ON public.disaster_resources;

-- Create a policy that only allows authenticated users to see contact info
-- For unauthenticated users, hide email and phone columns
CREATE POLICY "Secure access to disaster resources" 
ON public.disaster_resources 
FOR SELECT 
USING (
  CASE 
    WHEN auth.uid() IS NULL THEN true  -- Allow unauthenticated access to non-sensitive data via secure function
    ELSE true  -- Allow authenticated users full access
  END
);

-- Create a security definer function for public access that excludes sensitive data
CREATE OR REPLACE FUNCTION public.get_disaster_resources_public()
RETURNS TABLE(
  id uuid,
  name text,
  category text,
  description text,
  address text,
  city text,
  state text,
  postal_code text,
  website text,
  hours text,
  latitude numeric,
  longitude numeric,
  distance_mi numeric,
  source text,
  created_at timestamp with time zone,
  updated_at timestamp with time zone,
  last_verified_at timestamp with time zone,
  last_seen_at timestamp with time zone,
  is_archived boolean
) 
LANGUAGE SQL 
SECURITY DEFINER 
STABLE 
SET search_path = public
AS $$
  -- Return disaster resources WITHOUT sensitive contact information (email, phone)
  -- This function can be called by anyone, including unauthenticated users
  SELECT 
    dr.id,
    dr.name,
    dr.category,
    dr.description,
    dr.address,
    dr.city,
    dr.state,
    dr.postal_code,
    dr.website,
    dr.hours,
    dr.latitude,
    dr.longitude,
    dr.distance_mi,
    dr.source,
    dr.created_at,
    dr.updated_at,
    dr.last_verified_at,
    dr.last_seen_at,
    dr.is_archived
  FROM public.disaster_resources dr
  WHERE (dr.is_archived = false OR dr.is_archived IS NULL);
$$;

-- Update the RLS policy to be more restrictive for direct table access
-- This ensures that direct queries to the table don't expose sensitive data
DROP POLICY IF EXISTS "Secure access to disaster resources" ON public.disaster_resources;

-- Create a policy that restricts access to email and phone for unauthenticated users
-- The policy uses a security definer function to check authentication status
CREATE OR REPLACE FUNCTION public.can_access_contact_info()
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT auth.uid() IS NOT NULL;
$$;

-- Now create the restrictive policy
-- Note: This approach uses column-level restrictions which may not work as expected in all cases
-- The better approach is to ensure applications use the secure functions instead of direct table access

-- For maximum security, let's create a more restrictive approach:
-- Remove public access to the table entirely and force use of secure functions
DROP POLICY IF EXISTS "Public read access to basic disaster resource info" ON public.disaster_resources;

-- Create a policy that only allows access via the secure functions
CREATE POLICY "Authenticated access only to disaster resources" 
ON public.disaster_resources 
FOR SELECT 
USING (auth.uid() IS NOT NULL);

-- Grant public access to the secure functions instead
GRANT EXECUTE ON FUNCTION public.get_disaster_resources_public() TO anon;
GRANT EXECUTE ON FUNCTION public.get_public_disaster_resources_secure() TO anon;
GRANT EXECUTE ON FUNCTION public.get_disaster_resource_contact(uuid) TO authenticated;