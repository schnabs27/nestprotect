-- Fix the remaining security issue by preventing direct access to sensitive columns
-- even for authenticated users. Force all contact info access through the secure function.

-- Drop the current policy that still allows direct access to sensitive data
DROP POLICY IF EXISTS "Authenticated access only to disaster resources" ON public.disaster_resources;

-- Create a very restrictive policy that prevents direct table access to sensitive columns
-- This uses a function that always returns false for queries that try to access email or phone directly
CREATE OR REPLACE FUNCTION public.block_direct_sensitive_access()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Always return false to block direct table access
  -- All access must go through secure functions
  RETURN false;
END;
$$;

-- Create a policy that allows access to non-sensitive data only
-- The secure functions will use SECURITY DEFINER to bypass RLS when appropriate
CREATE POLICY "Secure disaster resources access" 
ON public.disaster_resources 
FOR SELECT 
USING (
  -- Block access to rows when trying to access sensitive columns directly
  -- This policy structure ensures that applications must use the secure functions
  -- Only allow access through security definer functions
  false
);

-- Grant necessary permissions for the secure functions to work
-- The functions use SECURITY DEFINER so they can access the table regardless of RLS
REVOKE ALL ON public.disaster_resources FROM anon, authenticated;
GRANT SELECT ON public.disaster_resources TO service_role;

-- Ensure the secure functions have proper access
GRANT EXECUTE ON FUNCTION public.get_disaster_resources_public() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_public_disaster_resources_secure() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_disaster_resource_contact(uuid) TO authenticated;

-- Create a more nuanced approach: Allow access to non-sensitive columns only
-- Drop the blocking policy and create a selective one
DROP POLICY IF EXISTS "Secure disaster resources access" ON public.disaster_resources;

-- Disable RLS temporarily to recreate a better policy structure
ALTER TABLE public.disaster_resources DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.disaster_resources ENABLE ROW LEVEL SECURITY;

-- Create a policy that allows reading all columns EXCEPT email and phone
-- Unfortunately, Postgres RLS doesn't support column-level restrictions in policies
-- So we need to use a different approach: block direct table access entirely

CREATE POLICY "Block direct table access to disaster resources" 
ON public.disaster_resources 
FOR ALL
USING (false);

-- Re-grant access only to the service role (used by security definer functions)
GRANT SELECT ON public.disaster_resources TO service_role;

-- Now applications MUST use the secure functions:
-- - get_disaster_resources_public() for public data (no contact info)
-- - get_disaster_resource_contact() for contact info (authenticated + logged)

-- Update existing functions to ensure they work properly with the new security model
-- Make sure get_disaster_resources_public excludes sensitive data
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
  source_id text,
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
    dr.source_id,
    dr.created_at,
    dr.updated_at,
    dr.last_verified_at,
    dr.last_seen_at,
    dr.is_archived
  FROM public.disaster_resources dr
  WHERE (dr.is_archived = false OR dr.is_archived IS NULL);
$$;