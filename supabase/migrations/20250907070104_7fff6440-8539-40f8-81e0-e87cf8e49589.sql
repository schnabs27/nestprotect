-- Restore proper RLS for disaster resources
-- The issue was we blocked ALL access, but authentication is already required
-- So we should allow authenticated users to see disaster resources

-- Drop the overly restrictive policy
DROP POLICY IF EXISTS "Block direct table access to disaster resources" ON public.disaster_resources;

-- Restore proper authenticated access
CREATE POLICY "Authenticated users can view disaster resources" 
ON public.disaster_resources 
FOR SELECT 
USING (auth.uid() IS NOT NULL);

-- Grant proper permissions back to authenticated users
GRANT SELECT ON public.disaster_resources TO authenticated;