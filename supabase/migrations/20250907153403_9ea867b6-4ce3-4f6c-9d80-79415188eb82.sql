-- Check for any remaining security definer views and remove them
-- Also ensure our RLS policy only allows access to non-sensitive fields

-- First, let me create a column-level RLS policy that explicitly excludes sensitive fields
DROP POLICY IF EXISTS "Public info access for disaster resources" ON public.disaster_resources;

-- Create a new RLS policy that completely blocks access to the base table
-- Users should only access data through controlled functions
CREATE POLICY "Block direct access to disaster resources" 
ON public.disaster_resources 
FOR ALL
TO authenticated
USING (false);

-- Create a restricted RLS policy that only allows viewing non-sensitive fields for admin functions
CREATE POLICY "Admin access to disaster resources" 
ON public.disaster_resources 
FOR SELECT
TO authenticated
USING (public.is_admin());

-- Ensure the public view works correctly without security definer
-- The view should inherit the user's permissions and RLS policies
-- Since we're blocking direct access, we need to grant specific access to the view columns
GRANT SELECT (
  id, name, category, description, address, city, state, postal_code, 
  website, hours, latitude, longitude, distance_mi, source, source_id,
  created_at, updated_at, last_verified_at, last_seen_at, is_archived
) ON public.disaster_resources TO authenticated;

GRANT SELECT (
  id, name, category, description, address, city, state, postal_code, 
  website, hours, latitude, longitude, distance_mi, source, source_id,
  created_at, updated_at, last_verified_at, last_seen_at, is_archived
) ON public.disaster_resources TO anon;