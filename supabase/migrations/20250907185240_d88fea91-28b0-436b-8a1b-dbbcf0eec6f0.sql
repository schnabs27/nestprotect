-- Fix RLS policies for disaster_resources table to allow unauthenticated reads for public access
-- and allow the service role to insert/update resources without restrictions

-- Drop the problematic policy that's blocking insertions
DROP POLICY IF EXISTS "Service role manages resources" ON public.disaster_resources;

-- Create a new policy that allows the service role to manage resources
CREATE POLICY "Service role full access" ON public.disaster_resources
FOR ALL TO service_role
USING (true)
WITH CHECK (true);

-- Ensure public read access without authentication for basic resource data
CREATE POLICY "Public read access" ON public.disaster_resources
FOR SELECT TO anon
USING (true);

-- Update the secure access policy to be more flexible for phone access
-- Phone numbers should be accessible without regional restrictions for emergency purposes
DROP POLICY IF EXISTS "Authenticated users view regional resources only" ON public.disaster_resources;

-- Create a more permissive authenticated user policy that allows phone access
CREATE POLICY "Authenticated users can view resources" ON public.disaster_resources
FOR SELECT TO authenticated
USING (true);